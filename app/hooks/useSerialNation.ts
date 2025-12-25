import { useState, useRef, useCallback } from 'react';
import { buildNationFrame, NATION_CMD, hexToBytes } from '../utils/nationProtocol';
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

  // --- 2. Xử lý phản hồi từ Reader ---
  const parseTagData = useCallback((frame: number[]) => {
    const category = frame[3]; // Vị trí Category trong frame 5A
    const mid = frame[4];      // Vị trí MID trong frame 5A

    // A. XỬ LÝ PHẢN HỒI LỆNH GHI (02 11)
    if (category === 0x02 && mid === 0x11) {
        const result = frame[7]; // Byte kết quả sau phần độ dài
        if (result === 0x00) {
            console.log("%c [RFID] GHI THẺ THÀNH CÔNG! ", "background: #059669; color: #fff; font-weight: bold;");
        } else {
            const errorMap: any = { 0x10: "Tag Lost (Thẻ quá xa)", 0x03: "Sai tham số", 0x08: "Sai Password/Thẻ bị khóa" };
            console.error("[RFID] GHI THẺ THẤT BẠI:", errorMap[result] || "Mã lỗi " + result);
        }
        return;
    }

    // B. XỬ LÝ DỮ LIỆU QUÉT THẺ (02 00)
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
          count: (prev.get(epc)?.count || 0) + 1,
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

  // --- 3. Đọc dữ liệu từ Serial ---
  const startReading = async (reader: any) => {
    readerRef.current = reader;
    let buffer: number[] = [];

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer.push(...Array.from(value as Uint8Array));

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

  // --- 4. Kết nối ---
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

  // --- 5. Bắt đầu quét ---
  const startScan = async () => {
    if (!writerRef.current) return;
    if (selectedAntennas.length === 0) {
      alert("Hãy chọn ít nhất 1 Antenna");
      return;
    }
    setTags(new Map()); 
    let mask = 0;
    selectedAntennas.forEach(ant => { mask |= (1 << (ant - 1)); });
    const payload = [0x00, 0x00, 0x00, mask, 0x01]; 
    const frame = buildNationFrame(NATION_CMD.START_INVENTORY.cat, NATION_CMD.START_INVENTORY.mid, payload);
    await writerRef.current.write(frame);
    setIsScanning(true);
  };

  // --- 6. Dừng quét ---
  const stopScan = async () => {
    if (!writerRef.current) return;
    const frame = buildNationFrame(NATION_CMD.STOP_INVENTORY.cat, NATION_CMD.STOP_INVENTORY.mid);
    await writerRef.current.write(frame);
    setIsScanning(false);
  };

  // --- 7. CHỨC NĂNG QUAN TRỌNG: GHI EPC ---
  const writeEpc = async (oldEpc: string, newEpc: string, antenna: number) => {
  if (!writerRef.current) return { success: false, msg: "Chưa kết nối cổng COM" };

  try {
    // 1. Dừng quét và chờ Reader nghỉ (Rất quan trọng)
    await stopScan();
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const oldEpcBytes = hexToBytes(oldEpc);
    const newEpcBytes = hexToBytes(newEpc);

    // 2. Tính toán PC Bits (Protocol Control) dựa trên độ dài EPC mới
    // Công thức từ code C#: (Số lượng Word << 11)
    // EPC 24 ký tự = 12 bytes = 6 words. 6 << 11 = 12288 (Hex: 0x3000)
    // EPC 16 ký tự = 8 bytes = 4 words. 4 << 11 = 8192 (Hex: 0x2000)
    const wordCount = newEpcBytes.length / 2;
    const pcValue = (wordCount << 11) & 0xFFFF;
    const pcBytes = [(pcValue >> 8) & 0xFF, pcValue & 0xFF];

    // Dữ liệu ghi xuống bao gồm: [2 byte PC] + [X byte EPC mới]
    const dataToWrite = [...pcBytes, ...newEpcBytes];
    
    // a. Antenna Port (M, 4 bytes)
    const antPart = [0x00, 0x00, 0x00, (1 << (antenna - 1))];

    // b. Data Area (M, 1 byte): 1 = EPC area
    const areaPart = [0x01];

    // c. Word Starting Address (M, 2 bytes): 0x0001 
    // Ghi từ Word 1 để bao gồm cả PC bits (như code C# mẫu)
    const startAddrPart = [0x00, 0x01];

    // d. Data Content (M, Variable): [LenH][LenL][Data]
    const contentPart = [
      (dataToWrite.length >> 8) & 0xFF,
      (dataToWrite.length & 0xFF),
      ...dataToWrite
    ];

    // e. PID 0x01: Match Filter (BỘ LỌC TÌM THẺ CŨ)
    // Cấu trúc: [PID][LenH][LenL][MatchArea][StartBitH][StartBitL][BitLen][Data]
    // Sửa địa chỉ bắt đầu là 32 (0x0020) theo chuẩn C# để khớp đúng mã EPC
    const matchData = [
      0x01,       // Match EPC area
      0x00, 0x20, // ĐỊA CHỈ BIT: 32 (0x0020)
      oldEpcBytes.length * 8, // Độ dài bit thẻ cũ
      ...oldEpcBytes
    ];
    const matchPID = [
      0x01, 
      (matchData.length >> 8) & 0xFF,
      (matchData.length & 0xFF),
      ...matchData
    ];

    // f. PID 0x02: Password (4 bytes)
    const pwdPID = [0x02, 0x00, 0x00, 0x00, 0x00];

    const payload = [
      ...antPart,
      ...areaPart,
      ...startAddrPart,
      ...contentPart,
      ...matchPID,
      ...pwdPID
    ];

    const frame = buildNationFrame(0x02, 0x11, payload);

    console.log(">>> [RFID DEBUG] ĐANG GHI EPC THEO CHUẨN C# & MANUAL <<<");
    console.log("Frame gửi đi:", Array.from(frame).map(b => b.toString(16).padStart(2, '0')).join(' '));

    await writerRef.current.write(frame);
    
    return { success: true, msg: "Lệnh ghi đã gửi. Hãy rescan sau vài giây!" };
  } catch (err: any) {
    return { success: false, msg: "Lỗi: " + err.message };
  }
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
    port, tags, isScanning, selectedAntennas, 
    connect, startScan, stopScan, toggleAntenna, 
    deleteTag, clearTags, writeEpc 
  };
}