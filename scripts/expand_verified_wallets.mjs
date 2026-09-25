import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import fs from 'fs';

const BASE_URL = 'https://preprod-service-v2-01.midnightexplorer.com/api/v1';
const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

async function fetchTxDetails(hash) {
  try {
    const res = await fetch(`${BASE_URL}/transactions/${hash}`);
    if (res.status !== 200) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function checkBatch(addresses) {
  const results = new Map();
  for (const a of addresses) results.set(a, new Map());

  await new Promise((resolve) => {
    const ws = new WebSocket(INDEXER_WS, 'graphql-transport-ws');
    const timer = setTimeout(() => { ws.close(); resolve(); }, 3500);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'connection_init' }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'connection_ack') {
        for (let i = 0; i < addresses.length; i++) {
          ws.send(JSON.stringify({
            id: `${i}`,
            type: 'subscribe',
            payload: {
              query: `
                subscription($a: UnshieldedAddress!) {
                  unshieldedTransactions(address: $a) {
                    ...on UnshieldedTransaction {
                      createdUtxos { tokenType value }
                      spentUtxos { tokenType value }
                    }
                  }
                }
              `,
              variables: { a: addresses[i] }
            }
          }));
        }
      } else if (msg.type === 'next' && msg.payload?.data?.unshieldedTransactions) {
        const idx = parseInt(msg.id);
        const addr = addresses[idx];
        const item = msg.payload.data.unshieldedTransactions;
        const bMap = results.get(addr);
        if (bMap) {
          if (item.createdUtxos) {
            for (const u of item.createdUtxos) {
              const cur = bMap.get(u.tokenType) || 0n;
              bMap.set(u.tokenType, cur + BigInt(u.value));
            }
          }
          if (item.spentUtxos) {
            for (const u of item.spentUtxos) {
              const cur = bMap.get(u.tokenType) || 0n;
              bMap.set(u.tokenType, cur - BigInt(u.value));
            }
          }
        }
      }
    };
    ws.onclose = () => { clearTimeout(timer); resolve(); };
    ws.onerror = () => { clearTimeout(timer); resolve(); };
  });

  const withAssets = [];
  for (const [addr, bMap] of results.entries()) {
    const pos = Array.from(bMap.entries()).filter(([, v]) => v > 0n);
    if (pos.length > 0) {
      withAssets.push({
        address: addr,
        assets: pos.length,
        night: pos.find(([k]) => k === '0000000000000000000000000000000000000000000000000000000000000000')?.[1]?.toString() || '0'
      });
    }
  }
  return withAssets;
}

async function main() {
  const existing = JSON.parse(fs.readFileSync('scripts/verified_wallets_with_assets.json', 'utf-8'));
  const knownAddrs = new Set(existing.map(w => w.address));
  console.log(`Currently have ${existing.length} verified wallets with assets.`);

  let cursor = '';
  // fetch until cursor or page 30
  let page = 0;
  const newCandidates = new Map(); // addr -> { sampleTx, blockHeight }

  while (existing.length + newCandidates.size < 140 && page < 40) {
    page++;
    const url = cursor ? `${BASE_URL}/transactions?cursor=${cursor}` : `${BASE_URL}/transactions`;
    let res;
    try {
      res = await fetch(url);
    } catch {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }
    if (!res.ok) break;
    const json = await res.json();
    const items = json.data?.items || [];
    cursor = json.data?.nextCursor || '';

    // fetch tx details in chunks of 5
    for (let i = 0; i < items.length; i += 5) {
      const chunk = items.slice(i, i + 5);
      const details = await Promise.all(chunk.map(tx => fetchTxDetails(tx.hash)));
      for (const d of details) {
        if (!d) continue;
        if (d.createdOutputs) {
          for (const out of d.createdOutputs) {
            let addr = out.owner;
            if (!addr) continue;
            if (addr.startsWith('0xmn_')) addr = addr.slice(2);
            if (!addr.startsWith('mn_addr_preprod1')) continue;
            if (!knownAddrs.has(addr) && !newCandidates.has(addr)) {
              newCandidates.set(addr, {
                sampleTx: d.hash,
                blockHeight: d.blockHeight
              });
            }
          }
        }
      }
    }

    process.stdout.write(`Page ${page} | New candidates: ${newCandidates.size}\r`);
    if (!cursor) break;
  }

  console.log(`\nCollected ${newCandidates.size} new candidate addresses. Checking assets...`);
  const candList = Array.from(newCandidates.keys());

  for (let i = 0; i < candList.length; i += 30) {
    const chunk = candList.slice(i, i + 30);
    const found = await checkBatch(chunk);
    for (const f of found) {
      const meta = newCandidates.get(f.address);
      existing.push({
        address: f.address,
        assets: f.assets,
        night: f.night,
        explorerTxCount: 1,
        sampleTx: meta?.sampleTx,
        blockHeight: meta?.blockHeight
      });
      knownAddrs.add(f.address);
    }
  }

  console.log(`TOTAL verified wallets with positive assets: ${existing.length}`);
  fs.writeFileSync('scripts/verified_wallets_with_assets.json', JSON.stringify(existing, null, 2));
}

main().catch(console.error);
