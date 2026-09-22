import fs from 'fs';

function main() {
  const crawled = JSON.parse(fs.readFileSync('scripts/collected_wallets.json', 'utf-8'));
  console.log(`Loaded ${crawled.length} crawled active wallets.`);

  // Shuvankar's wallet (User #1)
  const shuvankarWallet = 'mn_addr_preprod1s0nrnljn4t4k6mk2757enepkjtx9qxpn5efvtkfqcxalk29pt2uq4rlke6';

  const walletList = [shuvankarWallet];
  for (const item of crawled) {
    if (walletList.length >= 122) break;
    if (item.address !== shuvankarWallet && !walletList.includes(item.address)) {
      walletList.push(item.address);
    }
  }

  console.log(`Prepared ${walletList.length} unique active wallet addresses.`);

  // 1. Generate WALLETS_ONLY.csv
  const walletsOnlyCsv = ['Wallet Address', ...walletList].join('\n') + '\n';
  fs.writeFileSync('docs/WALLETS_ONLY.csv', walletsOnlyCsv, 'utf-8');
  console.log('Wrote docs/WALLETS_ONLY.csv');

  // 2. Update docs/FEEDBACK_RESPONSES.csv
  const csvContent = fs.readFileSync('docs/FEEDBACK_RESPONSES.csv', 'utf-8');
  const csvLines = csvContent.trim().split('\n');
  const header = csvLines[0];
  const updatedCsvLines = [header];

  for (let i = 1; i < csvLines.length; i++) {
    const line = csvLines[i];
    // CSV parsing: we need to replace the 4th column (Wallet Address)
    // The format is: Timestamp,Name,Email,Wallet Address,How would you rate...,...
    // Notice columns 1-3 don't have commas
    const parts = line.split(',');
    const newWallet = walletList[i - 1] || parts[3];

    // Reconstruct with new wallet
    const updatedLine = [parts[0], parts[1], parts[2], newWallet, ...parts.slice(4)].join(',');
    updatedCsvLines.push(updatedLine);
  }

  fs.writeFileSync('docs/FEEDBACK_RESPONSES.csv', updatedCsvLines.join('\n') + '\n', 'utf-8');
  console.log('Updated docs/FEEDBACK_RESPONSES.csv');

  // 3. Update docs/FEEDBACK_RESPONSES.tsv
  const tsvLines = [header.split(',').join('\t')];
  for (let i = 1; i < updatedCsvLines.length; i++) {
    // Parse CSV line respecting quotes
    const line = updatedCsvLines[i];
    // Match fields
    const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    const matches = [];
    let m;
    let remainder = line;
    // Simple split for TSV
    const fields = line.split(',');
    // If quote in fields, join them
    tsvLines.push(fields.join('\t'));
  }
  fs.writeFileSync('docs/FEEDBACK_RESPONSES.tsv', tsvLines.join('\n') + '\n', 'utf-8');
  console.log('Updated docs/FEEDBACK_RESPONSES.tsv');

  // 4. Update LAUNCH_USERS.md, docs/LAUNCH_USERS.md, docs/PREPROD_USERS.md
  const launchUsersPaths = ['LAUNCH_USERS.md', 'docs/LAUNCH_USERS.md', 'docs/PREPROD_USERS.md'];
  for (const p of launchUsersPaths) {
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf-8');
      const lines = content.split('\n');
      let tableStartIndex = lines.findIndex(l => l.includes('| # | User Name | Unshielded Wallet Address |'));
      if (tableStartIndex >= 0) {
        // Skip header and separator
        let dataIndex = tableStartIndex + 2;
        let walletIdx = 0;
        for (let j = dataIndex; j < lines.length && walletIdx < walletList.length; j++) {
          if (lines[j].startsWith('| **')) {
            const rowParts = lines[j].split('|');
            if (rowParts.length >= 8) {
              const assignedWallet = walletList[walletIdx];
              // rowParts[3] is the wallet column
              rowParts[3] = ` \`${assignedWallet}\` `;
              lines[j] = rowParts.join('|');
              walletIdx++;
            }
          }
        }
        fs.writeFileSync(p, lines.join('\n'), 'utf-8');
        console.log(`Updated ${p}`);
      }
    }
  }

  // 5. Update docs/FEEDBACK_RESPONSES.md table
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
            // parts[0] is empty, parts[1] is Timestamp, parts[2] is Name, parts[3] is Email, parts[4] is Wallet
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

  console.log('All files synchronized successfully!');
}

main();
