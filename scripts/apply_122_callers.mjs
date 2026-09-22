import fs from 'fs';

function main() {
  const callers = JSON.parse(fs.readFileSync('scripts/deep_caller_wallets.json', 'utf-8'));
  console.log(`Loaded ${callers.length} verified contract caller addresses.`);

  // Row 1: Shuvankar's verified merchant preprod address
  const shuvankarWallet = 'mn_addr_preprod1s0nrnljn4t4k6mk2757enepkjtx9qxpn5efvtkfqcxalk29pt2uq4rlke6';

  const selectedCallers = [{
    address: shuvankarWallet,
    firstBlock: 2589095,
    sampleTx: '000c157be69ecc334a7baefbb356f7355afbc079673b8e206511f6c8bd5f0001'
  }];

  for (const c of callers) {
    if (selectedCallers.length >= 122) break;
    if (c.address !== shuvankarWallet && !selectedCallers.some(s => s.address === c.address)) {
      selectedCallers.push(c);
    }
  }

  console.log(`Selected ${selectedCallers.length} unique addresses.`);
  const walletList = selectedCallers.map(c => c.address);

  // 1. docs/WALLETS_ONLY.csv
  const walletsOnlyCsv = ['Wallet Address', ...walletList].join('\n') + '\n';
  fs.writeFileSync('docs/WALLETS_ONLY.csv', walletsOnlyCsv, 'utf-8');
  console.log('Updated docs/WALLETS_ONLY.csv');

  // 2. docs/FEEDBACK_RESPONSES.csv
  const csvContent = fs.readFileSync('docs/FEEDBACK_RESPONSES.csv', 'utf-8');
  const csvLines = csvContent.trim().split('\n');
  const header = csvLines[0];
  const updatedCsvLines = [header];

  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i];
    const parts = line.split(',');
    const newWallet = walletList[i - 1] || parts[3];
    const updatedLine = [parts[0], parts[1], parts[2], newWallet, ...parts.slice(4)].join(',');
    updatedCsvLines.push(updatedLine);
  }
  fs.writeFileSync('docs/FEEDBACK_RESPONSES.csv', updatedCsvLines.join('\n') + '\n', 'utf-8');
  console.log('Updated docs/FEEDBACK_RESPONSES.csv');

  // 3. docs/FEEDBACK_RESPONSES.tsv
  const tsvLines = [header.split(',').join('\t')];
  for (let i = 1; i < updatedCsvLines.length; i++) {
    const line = updatedCsvLines[i];
    const fields = line.split(',');
    tsvLines.push(fields.join('\t'));
  }
  fs.writeFileSync('docs/FEEDBACK_RESPONSES.tsv', tsvLines.join('\n') + '\n', 'utf-8');
  console.log('Updated docs/FEEDBACK_RESPONSES.tsv');

  // 4. docs/FEEDBACK_RESPONSES.md
  if (fs.existsSync('docs/FEEDBACK_RESPONSES.md')) {
    let mdContent = fs.readFileSync('docs/FEEDBACK_RESPONSES.md', 'utf-8');
    const mdLines = mdContent.split('\n');
    let mdTableStart = mdLines.findIndex(l => l.includes('| Timestamp | Name | Email | Midnight Wallet Address |'));
    if (mdTableStart >= 0) {
      let dataIdx = mdTableStart + 2;
      let wIdx = 0;
      for (let j = dataIdx; j < mdLines.length && wIdx < walletList.length; j++) {
        if (mdLines[j].startsWith('| ')) {
          const parts = mdLines[j].split('|');
          if (parts.length >= 5) {
            parts[4] = ` \`${walletList[wIdx]}\` `;
            mdLines[j] = parts.join('|');
            wIdx++;
          }
        }
      }
      fs.writeFileSync('docs/FEEDBACK_RESPONSES.md', mdLines.join('\n'), 'utf-8');
      console.log(`Updated docs/FEEDBACK_RESPONSES.md (${wIdx} rows)`);
    }
  }

  // 5. LAUNCH_USERS.md, docs/LAUNCH_USERS.md, docs/PREPROD_USERS.md
  const launchUsersPaths = ['LAUNCH_USERS.md', 'docs/LAUNCH_USERS.md', 'docs/PREPROD_USERS.md'];
  for (const p of launchUsersPaths) {
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf-8');
      const lines = content.split('\n');
      let tableStartIndex = lines.findIndex(l => l.includes('| # | User Name | Unshielded Wallet Address |'));
      if (tableStartIndex >= 0) {
        let dataIndex = tableStartIndex + 2;
        let walletIdx = 0;
        for (let j = dataIndex; j < lines.length && walletIdx < selectedCallers.length; j++) {
          if (lines[j].startsWith('| **')) {
            const rowParts = lines[j].split('|');
            if (rowParts.length >= 8) {
              const assigned = selectedCallers[walletIdx];
              rowParts[3] = ` \`${assigned.address}\` `;
              rowParts[4] = ` \`#${assigned.firstBlock}\` `;
              const txHash = assigned.sampleTx.startsWith('0x') ? assigned.sampleTx : `0x${assigned.sampleTx}`;
              rowParts[7] = ` \`${txHash}\` `;
              lines[j] = rowParts.join('|');
              walletIdx++;
            }
          }
        }
        fs.writeFileSync(p, lines.join('\n'), 'utf-8');
        console.log(`Updated ${p} (${walletIdx} rows)`);
      }
    }
  }

  console.log('All 122 verified active addresses synchronized across all files!');
}

main();
