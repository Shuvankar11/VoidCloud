import fs from 'fs';

const BASE_URL = 'https://preprod-service-v2-01.midnightexplorer.com/api/v1';

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

async function main() {
  console.log('Starting collection of real Midnight Preprod active wallets with assets...');
  
  let cursor = '';
  const wallets = new Map(); // address -> { address, txCount, netBalance, sampleTx, blockHeight }
  let page = 0;

  while (wallets.size < 135 && page < 200) {
    page++;
    const url = cursor ? `${BASE_URL}/transactions?cursor=${cursor}` : `${BASE_URL}/transactions`;
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      console.log('Fetch error, waiting 1s...');
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    if (res.status !== 200) {
      console.log(`Page ${page} returned status ${res.status}`);
      break;
    }

    const json = await res.json();
    const items = json.data?.items || [];
    cursor = json.data?.nextCursor || '';

    // Fetch details for these transactions concurrently in chunks of 5
    for (let i = 0; i < items.length; i += 5) {
      const chunk = items.slice(i, i + 5);
      const details = await Promise.all(chunk.map(tx => fetchTxDetails(tx.hash)));

      for (const d of details) {
        if (!d) continue;

        // Collect from createdOutputs
        if (d.createdOutputs) {
          for (const out of d.createdOutputs) {
            let addr = out.owner;
            if (!addr) continue;
            if (addr.startsWith('0xmn_')) addr = addr.slice(2);
            if (!addr.startsWith('mn_addr_preprod1')) continue;

            const w = wallets.get(addr) || {
              address: addr,
              txCount: 0,
              netBalance: 0n,
              sampleTx: d.hash,
              blockHeight: d.blockHeight,
            };
            w.txCount++;
            w.netBalance += BigInt(out.value || 0);
            w.blockHeight = Math.max(w.blockHeight || 0, d.blockHeight || 0);
            wallets.set(addr, w);
          }
        }

        // Collect from spentOutputs
        if (d.spentOutputs) {
          for (const out of d.spentOutputs) {
            let addr = out.owner;
            if (!addr) continue;
            if (addr.startsWith('0xmn_')) addr = addr.slice(2);
            if (!addr.startsWith('mn_addr_preprod1')) continue;

            const w = wallets.get(addr) || {
              address: addr,
              txCount: 0,
              netBalance: 0n,
              sampleTx: d.hash,
              blockHeight: d.blockHeight,
            };
            w.txCount++;
            w.netBalance -= BigInt(out.value || 0);
            w.blockHeight = Math.max(w.blockHeight || 0, d.blockHeight || 0);
            wallets.set(addr, w);
          }
        }
      }
    }

    // Filter wallets with remaining asset balance (> 0) or multiple transactions
    const validWallets = Array.from(wallets.values()).filter(w => w.netBalance > 0n || w.txCount > 1);
    process.stdout.write(`\rPage ${page} | Unique unshielded wallets: ${wallets.size} | Wallets with assets/multi-tx: ${validWallets.length}`);

    if (validWallets.length >= 130) {
      console.log('\nTarget of 130 active wallets reached!');
      break;
    }

    if (!cursor) break;
  }

  console.log('\nProcessing results...');
  const activeWallets = Array.from(wallets.values())
    .filter(w => w.netBalance > 0n || w.txCount > 1)
    .sort((a, b) => b.txCount - a.txCount);

  console.log(`Found ${activeWallets.length} active wallets with assets/multi-tx.`);

  fs.writeFileSync('scripts/collected_wallets.json', JSON.stringify(activeWallets, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
}

main().catch(console.error);
