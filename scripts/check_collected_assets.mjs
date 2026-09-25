import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import fs from 'fs';

const INDEXER_WS = 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

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
  const wallets = JSON.parse(fs.readFileSync('scripts/collected_wallets.json', 'utf-8'));
  console.log(`Checking all ${wallets.length} wallets from collected_wallets.json...`);

  const results = [];
  for (let i = 0; i < wallets.length; i += 30) {
    const chunk = wallets.slice(i, i + 30).map(w => w.address);
    const found = await checkBatch(chunk);
    for (const f of found) {
      const orig = wallets.find(w => w.address === f.address);
      results.push({
        ...f,
        explorerTxCount: orig?.txCount,
        sampleTx: orig?.sampleTx,
        blockHeight: orig?.blockHeight
      });
    }
  }

  console.log(`Found ${results.length} wallets with positive assets right now!`);
  fs.writeFileSync('scripts/verified_wallets_with_assets.json', JSON.stringify(results, null, 2));
}

main().catch(console.error);
