import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

import { hexToAddress } from './bech32m_test.mjs';
import fs from 'fs';

const BASE_URL = 'https://preprod-service-v2-01.midnightexplorer.com/api/v1';
const CONTRACT_ADDR = '89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0';

async function fetchTx(hash) {
  try {
    const res = await fetch(`${BASE_URL}/transactions/${hash}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function collectAll() {
  console.log('Scanning all pages for calls to contract 0x' + CONTRACT_ADDR);
  let cursor = '';
  const callersMap = new Map();
  let page = 0;
  let totalCalls = 0;

  while (page < 30) {
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

    for (let i = 0; i < items.length; i += 10) {
      const chunk = items.slice(i, i + 10);
      const details = await Promise.all(chunk.map(tx => fetchTx(tx.hash)));
      for (const d of details) {
        if (!d || !d.contractActions) continue;

        const calls = d.contractActions.filter(ca => 
          ca.address?.toLowerCase().replace('0x', '') === CONTRACT_ADDR
        );

        if (calls.length > 0) {
          totalCalls++;
          if (d.identifiers) {
            for (const id of d.identifiers) {
              const addr = hexToAddress(id);
              if (addr && addr.startsWith('mn_addr_preprod1')) {
                if (!callersMap.has(addr)) {
                  callersMap.set(addr, {
                    address: addr,
                    identifier: id,
                    sampleTx: d.hash,
                    blockHeight: d.blockHeight,
                    entryPoints: calls.map(c => c.entryPoint)
                  });
                }
              }
            }
          }
        }
      }
    }
    process.stdout.write(`Page ${page} | Contract calls: ${totalCalls} | Callers: ${callersMap.size}\r`);
    if (!cursor) break;
  }

  console.log(`\n\nTotal contract calls: ${totalCalls}`);
  console.log(`Total unique callers: ${callersMap.size}`);

  const callerList = Array.from(callersMap.values());
  fs.writeFileSync('scripts/voidcloud_contract_callers.json', JSON.stringify(callerList, null, 2));
}

collectAll().catch(console.error);
