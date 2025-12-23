import { useState, useRef, useCallback } from 'react';
import { buildNationFrame, NATION_CMD } from '../utils/nationProtocol';
import { Storage, Tag } from '../utils/storage';

export interface ScannedTag {
  epc: string;
  antenna: number;
  productId?: string;
  productName: string;
  categoryName: string;
  lastSeen: string;
}

export function useSerialNation() {
  const [port, setPort] = useState<any>(null);
  const [tags, setTags] = useState<Map<string, Tag>>(new Map());
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAntennas, setSelectedAntennas] = useState<number[]>([1]);

  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // --- 1. Logic chọn Antenna ---
  const toggleAntenna = (id: number) => {
    setSelectedAntennas(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id) 
        : [...prev, id].sort()
    );
  };

  const parseTagData = useCallback((frame: number[]) => {
    const mid = frame[4];
    if (mid === 0x00) {
      const dataPayload = frame.slice(7, frame.length - 2);
      const epcLen = (dataPayload[0] << 8) | dataPayload[1];
      const epc = dataPayload.slice(2, 2 + epcLen).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
      const antId = dataPayload[2 + epcLen + 2];
      
      const tagDb = Storage.getTags();       
      const productDb = Storage.getProducts(); 
      const catDb = Storage.getCategories();   
      const registeredTag = tagDb.find(t => t.epc.toUpperCase() === epc);
      
      let pId = "unknown";
      let productName = "Thẻ chưa khai báo";
      let categoryName = "—";
      let unit = "";

      if (registeredTag) {
          pId = registeredTag.productId;
          const product = productDb.find(p => p.ProductId === pId);
          if (product) {
              productName = product.name;
              unit = product.unit;
              const cat = catDb.find(c => c.CategoryId === product.categoryId);
              categoryName = cat ? cat.name : "Chưa phân loại";
          }
      }

      const currentTime = new Date().toLocaleTimeString('vi-VN', { hour12: false });

      setTags(prev => {
        const newMap = new Map(prev);
        newMap.set(epc, {
          epc,
          antenna: antId || 1,
          count: (prev.get(epc)?.count || 0) + 1, // Số lần xung nhịp reader đọc trúng
          firstSeen: prev.get(epc)?.firstSeen || currentTime,
          lastSeen: currentTime,
          productId: pId,
          productName,
          categoryName,
          unit
        });
        return newMap;
      });
    }
}, []);


  const startReading = async (reader: any) => {
    readerRef.current = reader;
    let buffer: number[] = [];

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer.push(...Array.from(value as Uint8Array));

        // Xử lý bộ đệm tìm Frame 0x5A
        while (buffer.length >= 9) {
          const headerIdx = buffer.indexOf(0x5A);
          if (headerIdx === -1) { buffer = []; break; }
          if (headerIdx > 0) buffer = buffer.slice(headerIdx);

          if (buffer.length < 7) break;
          const dataLen = (buffer[5] << 8) | buffer[6];
          const totalFrameLen = 1 + 4 + 2 + dataLen + 2;

          if (buffer.length < totalFrameLen) break;

          const frame = buffer.slice(0, totalFrameLen);
          buffer = buffer.slice(totalFrameLen);
          
          parseTagData(frame);
        }
      }
    } catch (err) {
      console.error("Lỗi đọc Serial:", err);
    } finally {
      reader.releaseLock();
    }
  };

  const connect = async () => {
    try {
      const selectedPort = await (navigator as any).serial.requestPort();
      await selectedPort.open({ baudRate: 115200 });
      
      setPort(selectedPort);
      writerRef.current = selectedPort.writable.getWriter();
      startReading(selectedPort.readable.getReader());
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert("Không thể kết nối cổng COM.");
    }
  };

  const startScan = async () => {
    if (!writerRef.current) return;
    if (selectedAntennas.length === 0) {
      alert("Hãy chọn ít nhất 1 Antenna");
      return;
    }

    setTags(new Map()); 

    // Tạo Bitmask cho Antenna
    let mask = 0;
    selectedAntennas.forEach(ant => {
      mask |= (1 << (ant - 1));
    });

    // Payload: [Mask 4 bytes] + [Continuous Flag 1 byte]
    const payload = [0x00, 0x00, 0x00, mask, 0x01]; 

    const frame = buildNationFrame(
      NATION_CMD.START_INVENTORY.cat, 
      NATION_CMD.START_INVENTORY.mid, 
      payload
    );

    await writerRef.current.write(frame);
    setIsScanning(true);
  };

  const stopScan = async () => {
    if (!writerRef.current) return;
    
    const frame = buildNationFrame(
      NATION_CMD.STOP_INVENTORY.cat, 
      NATION_CMD.STOP_INVENTORY.mid
    );
    
    await writerRef.current.write(frame);
    setIsScanning(false);
  };

  const deleteTag = (epc: string) => {
    setTags(prev => {
      const newMap = new Map(prev);
      newMap.delete(epc);
      return newMap;
    });
  };

  const clearTags = () => {
    setTags(new Map());
  };

  return { 
    port, 
    tags, 
    isScanning, 
    selectedAntennas, 
    connect, 
    startScan, 
    stopScan, 
    toggleAntenna, 
    deleteTag, 
    clearTags 
  };
}