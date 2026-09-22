// Pure JS Bech32m Implementation based on BIP-0173 and BIP-0350
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
const BECH32M_CONST = 0x2bc830a3;

function polymod(values) {
  let chk = 1;
  for (let p = 0; p < values.length; ++p) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ values[p];
    for (let i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i];
      }
    }
  }
  return chk;
}

function hrpExpand(hrp) {
  const ret = [];
  for (let p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) >> 5);
  }
  ret.push(0);
  for (let p = 0; p < hrp.length; ++p) {
    ret.push(hrp.charCodeAt(p) & 31);
  }
  return ret;
}

function createChecksum(hrp, data) {
  const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const mod = polymod(values) ^ BECH32M_CONST;
  const ret = [];
  for (let p = 0; p < 6; ++p) {
    ret.push((mod >> (5 * (5 - p))) & 31);
  }
  return ret;
}

function toWords(bytes) {
  let value = 0;
  let bits = 0;
  const maxv = 31;
  const ret = [];
  for (let i = 0; i < bytes.length; ++i) {
    value = (value << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      ret.push((value >> bits) & maxv);
    }
  }
  if (bits > 0) {
    ret.push((value << (5 - bits)) & maxv);
  }
  return ret;
}

function fromWords(words) {
  let value = 0;
  let bits = 0;
  const ret = [];
  for (let i = 0; i < words.length; ++i) {
    value = (value << 5) | words[i];
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      ret.push((value >> bits) & 0xff);
    }
  }
  return new Uint8Array(ret);
}

function encode(hrp, words) {
  const checksum = createChecksum(hrp, words);
  let ret = hrp + '1';
  for (let p = 0; p < words.length; ++p) {
    ret += CHARSET.charAt(words[p]);
  }
  for (let p = 0; p < checksum.length; ++p) {
    ret += CHARSET.charAt(checksum[p]);
  }
  return ret;
}

function decode(bechString) {
  const pos = bechString.lastIndexOf('1');
  const hrp = bechString.slice(0, pos);
  const data = [];
  for (let p = pos + 1; p < bechString.length; ++p) {
    const d = CHARSET.indexOf(bechString.charAt(p));
    if (d === -1) return null;
    data.push(d);
  }
  const words = data.slice(0, -6);
  return { hrp, words, bytes: fromWords(words) };
}

// Convert 32-byte hex to Midnight Preprod address
function hexToAddress(hex) {
  const cleanHex = hex.replace(/^0x/, '').toLowerCase();
  const rawHex = cleanHex.length === 66 && cleanHex.startsWith('00') ? cleanHex.slice(2) : cleanHex;
  const bytes = new Uint8Array(rawHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const words = toWords(bytes);
  return encode('mn_addr_preprod', words);
}

// Convert Midnight Preprod address to identifier
function addressToIdentifier(addr) {
  const decoded = decode(addr);
  if (!decoded) return null;
  const hex = Buffer.from(decoded.bytes).toString('hex');
  return `0x00${hex}`;
}

// Test with Shuvankar's address
const shuvankar = 'mn_addr_preprod1s0nrnljn4t4k6mk2757enepkjtx9qxpn5efvtkfqcxalk29pt2uq4rlke6';
const ident = addressToIdentifier(shuvankar);
const reEncoded = hexToAddress(ident);

export { decode, encode, hexToAddress, addressToIdentifier };

