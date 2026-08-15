// Cardano & Midnight Bech32 Address Decoder
// Converts raw CIP-30 CBOR hex address into exact Bech32 address matching Lace UI

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
  let chk = 1;
  for (const value of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    if ((top >> 0) & 1) chk ^= 0x3b2d38f8;
    if ((top >> 1) & 1) chk ^= 0x0e3779b9;
    if ((top >> 2) & 1) chk ^= 0x43d38763;
    if ((top >> 3) & 1) chk ^= 0x211b402e;
    if ((top >> 4) & 1) chk ^= 0x282b8aee;
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
  return ret;
}

function convertBits(data: Uint8Array, frombits: number, tobits: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << tobits) - 1;
  for (const value of data) {
    acc = (acc << frombits) | value;
    bits += frombits;
    while (bits >= tobits) {
      bits -= tobits;
      ret.push((acc >> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) ret.push((acc << (tobits - bits)) & maxv);
  }
  return ret;
}

export function encodeBech32(hrp: string, data: Uint8Array): string {
  const words = convertBits(data, 8, 5, true);
  const combined = bech32HrpExpand(hrp).concat(words).concat([0, 0, 0, 0, 0, 0]);
  const mod = bech32Polymod(combined) ^ 1;
  const checksum: number[] = [];
  for (let p = 0; p < 6; p++) {
    checksum.push((mod >> (5 * (5 - p))) & 31);
  }
  let result = hrp + '1';
  for (const b of words.concat(checksum)) {
    result += CHARSET.charAt(b);
  }
  return result;
}

export function formatRealLaceAddress(rawAddress: string): string {
  if (!rawAddress) return '';
  const clean = rawAddress.trim();

  // If already Bech32 (e.g. addr_test1... or addr1... or mn_...)
  if (clean.startsWith('addr_test1') || clean.startsWith('addr1') || clean.startsWith('mn_')) {
    return clean;
  }

  // If it's a hex-encoded address string from CIP-30
  try {
    const hex = clean.startsWith('0x') ? clean.slice(2) : clean;
    if (/^[0-9a-fA-F]+$/.test(hex) && hex.length >= 56) {
      const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      if (bytes.length > 0) {
        const header = bytes[0];
        const isTestnet = (header & 0x0f) === 0;
        const hrp = isTestnet ? 'addr_test' : 'addr';
        return encodeBech32(hrp, bytes);
      }
    }
  } catch (err) {
    console.warn('[Bech32] Could not decode hex address:', err);
  }

  return clean;
}
