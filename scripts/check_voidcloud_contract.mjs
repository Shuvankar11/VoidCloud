async function checkContract() {
  const contractAddress = "89e233ecf339175aecbc07ba419e998edc8c3115c2bdc23b7cc120e2cc6adcf0";
  const query = `
    query {
      contractAction(address: "${contractAddress}") {
        address
        state
        zswapState
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
  console.log('Contract check result:', JSON.stringify(data, null, 2));
}

checkContract().catch(console.error);
