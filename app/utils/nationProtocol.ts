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


export function buildNationFrame(category: number, mid: number, data: number[] = []): Uint8Array {
  const header = 0x5a;
  
  const pcw = [0x00, 0x01, category, mid];
  const dataLen = [(data.length >> 8) & 0xff, data.length & 0xff];
  
  const contentToCrc = [...pcw, ...dataLen, ...data];
  const crc = crc16_ccitt(contentToCrc);
  const crcBytes = [(crc >> 8) & 0xff, crc & 0xff];

  return new Uint8Array([header, ...contentToCrc, ...crcBytes]);
}

export const NATION_CMD = {
  START_INVENTORY: { cat: 0x02, mid: 0x10 }, 
  STOP_INVENTORY: { cat: 0x02, mid: 0xff },
};