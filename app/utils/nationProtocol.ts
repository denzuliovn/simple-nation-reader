export const NATION_CMD = {
  START_INVENTORY: { cat: 0x02, mid: 0x10 }, 
  STOP_INVENTORY: { cat: 0x02, mid: 0xff },
  WRITE_EPC_TAG: { cat: 0x02, mid: 0x11 }, 
};

export const MEMORY_AREA = {
  RESERVED: 0x00,
  EPC: 0x01,
  TID: 0x02,
  USER: 0x03,
}

export function getBitLength(hex: string): number {
  return (hex.length / 2) * 8;
}

export function crc16_ccitt(data: number[]): number {
  let crc = 0x0000;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc;
}

export function hexToBytes(hex: string): number[] {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}


export function buildNationFrame(category: number, mid: number, data: number[] = []): Uint8Array {
  const header = 0x5a;
  
  const pcw = [0x00, 0x01, category, mid];
  const dataLen = [(data.length >> 8) & 0xff, data.length & 0xff];
  
  const contentToCrc = [...pcw, ...dataLen, ...data];
  const crc = crc16_ccitt(contentToCrc);
  const crcBytes = [(crc >> 8) & 0xff, crc & 0xff];

  return new Uint8Array([header, ...contentToCrc, ...crcBytes]);
}