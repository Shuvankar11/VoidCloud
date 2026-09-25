import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

const INDEXER = 'https://indexer.preprod.midnight.network/api/v4/graphql';

async function getAllActions(contractAddress) {
  console.log(`Getting all actions for ${contractAddress}...`);
  let currentHeight = null;
  const actions = [];
  const callers = new Set();

  for (let i = 0; i < 500; i++) {
    const offsetPart = currentHeight ? `, offset: { blockOffset: { height: ${currentHeight - 1} } }` : '';
    const query = `
      query {
        contractAction(address: "${contractAddress}"${offsetPart}) {
          address
          entryPoint
          transaction {
            hash
            identifiers
            block { height timestamp }
          }
        }
      }
    `;

    const res = await fetch(INDEXER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    const ca = data.data?.contractAction;
    if (!ca || !ca.transaction) {
      console.log(`\nFinished at iteration ${i}. Total actions: ${actions.length}`);
      break;
    }

    const tx = ca.transaction;
    actions.push({
      entryPoint: ca.entryPoint,
      hash: tx.hash,
      height: tx.block?.height,
      identifiers: tx.identifiers || []
    });

    if (tx.identifiers) {
      for (const id of tx.identifiers) callers.add(id);
    }

    currentHeight = tx.block?.height;
    process.stdout.write(`Action #${actions.length}: Block ${currentHeight} | Total Callers: ${callers.size}\r`);
  }

  console.log(`\nDONE! Total actions on this contract: ${actions.length}`);
  console.log(`Total unique caller identifiers: ${callers.size}`);
  return { actions, callers: Array.from(callers) };
}

getAllActions('89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0');
