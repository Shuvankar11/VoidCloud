async function getAllContractActions() {
  const contractAddress = "89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0";
  console.log(`Querying actions for contract ${contractAddress}...`);

  let currentHeight = null;
  const actions = [];

  for (let i = 0; i < 50; i++) {
    const offsetPart = currentHeight ? `, offset: { blockOffset: { height: ${currentHeight - 1} } }` : '';
    const query = `
      query {
        contractAction(address: "${contractAddress}"${offsetPart}) {
          address
          state
          transaction {
            hash
            block { height timestamp }
          }
        }
      }
    `;

    const res = await fetch('https://indexer.preprod.midnight.network/api/v4/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    if (data.errors) {
      console.log('Error:', data.errors);
      break;
    }
    const ca = data.data?.contractAction;
    if (!ca || !ca.transaction) {
      console.log(`Stopped at step ${i} (no more actions).`);
      break;
    }

    const tx = ca.transaction;
    actions.push({
      height: tx.block?.height,
      hash: tx.hash
    });
    console.log(`Action #${i + 1}: Block ${tx.block?.height} | Tx ${tx.hash}`);

    currentHeight = tx.block?.height;
    if (currentHeight <= 2589085) {
      console.log('Reached deployment block 2589085!');
      break;
    }
  }

  console.log(`Total contract actions found: ${actions.length}`);
}

getAllContractActions().catch(console.error);
