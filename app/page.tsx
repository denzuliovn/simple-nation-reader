"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useSerialNation } from './hooks/useSerialNation';
import { TagTable } from './components/TagTable';
import { Storage, Product } from './utils/storage';
import { WriteEpcModal } from './components/WriteEpcModal'; // Component mới
import { 
  Radio, 
  Play, 
  Square, 
  Link, 
  Trash2, 
  Database, 
  Cpu,
  PackageSearch
} from 'lucide-react';

export default function HomePage() {
  const { 
    port, 
    tags, 
    isScanning, 
    selectedAntennas,
    connect, 
    startScan, 
    stopScan, 
    toggleAntenna, 
    clearTags, 
    deleteTag,
    writeEpc // Lấy hàm writeEpc từ hook
  } = useSerialNation();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [writeModal, setWriteModal] = useState({ open: false, tag: null as any });

  useEffect(() => {
    setAllProducts(Storage.getProducts());
  }, [tags, isScanning]);

  const handleImportProduct = (epc: string, productId: string) => {
    if (!productId) return;
    Storage.addTag(epc, productId);
    alert(`Đã liên kết mã EPC ${epc.slice(-4)}... với sản phẩm thành công!`);
  };

  // Xử lý xác nhận ghi EPC mới
  const handleConfirmWrite = async (newEpc: string) => {
    if (!writeModal.tag) return;
    
    // Gửi lệnh ghi qua cổng Serial
    const result = await writeEpc(
      writeModal.tag.epc, 
      newEpc, 
      writeModal.tag.antenna
    );

    if (result.success) {
      alert("Đã gửi lệnh ghi EPC. Hãy quét lại để cập nhật mã mới!");
      setWriteModal({ open: false, tag: null });
      clearTags(); // Xóa list hiện tại để khi scan lại hiện mã mới
    } else {
      alert(result.msg);
    }
  };

  const displayData = useMemo(() => {
    const scannedArray = Array.from(tags.values());
    const groups = scannedArray.reduce((acc, tag) => {
      const isUnregistered = tag.productId === "unknown";
      const key = isUnregistered ? `unreg-${tag.epc}` : tag.productId;
      if (!acc[key]) {
        acc[key] = { ...tag, totalItems: 0, uniqueEpcs: new Set() };
      }
      if (!acc[key].uniqueEpcs.has(tag.epc)) {
        acc[key].uniqueEpcs.add(tag.epc);
        acc[key].totalItems += 1;
      }
      acc[key].lastSeen = tag.lastSeen;
      acc[key].antenna = tag.antenna;
      return acc;
    }, {} as Record<string, any>);
    return Object.values(groups);
  }, [tags]);

  return (
    <main className="p-4 md:p-10 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Cpu className="text-blue-600" size={32} />
              NATION <span className="text-blue-600">SCANNER</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex flex-col items-end">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Database size={16} className="text-blue-500" />
                <span className="text-sm font-bold text-slate-700">{displayData.length} products</span>
              </div>
            </div>
            <button onClick={clearTags} className="p-3 text-slate-300 hover:text-rose-600 rounded-xl"><Trash2 size={24} /></button>
          </div>
        </header>

        {/* --- CONTROL PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap items-center gap-10">
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Link size={14} /> PORT status</span>
              <button onClick={connect} className={`px-6 py-3 rounded-2xl font-black text-xs ${port ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-800 text-white'}`}>
                {port ? "✓ CONNECTED" : "SELECT COM PORT"}
              </button>
            </div>
            <div className="space-y-3 flex-1 min-w-[240px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Radio size={14} /> Antenna selection</span>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(id => (
                  <button key={id} onClick={() => toggleAntenna(id)} className={`flex-1 h-12 rounded-2xl border-2 font-black ${selectedAntennas.includes(id) ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 bg-slate-50 text-slate-400'}`}>{id}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4">
            <button onClick={startScan} disabled={!port || isScanning} className="flex-1 flex flex-col items-center justify-center bg-emerald-500 text-white h-28 rounded-3xl disabled:opacity-20 transition-all shadow-xl active:scale-95">
              <Play fill="currentColor" size={24} />
              <span className="font-black text-[10px] tracking-widest">Start scan</span>
            </button>
            <button onClick={stopScan} disabled={!isScanning} className="flex-1 flex flex-col items-center justify-center bg-rose-500 text-white h-28 rounded-3xl disabled:opacity-20 shadow-xl active:scale-95">
              <Square fill="currentColor" size={24} />
              <span className="font-black text-[10px] tracking-widest">Stop scan</span>
            </button>
          </div>
        </div>

        {/* --- DANH SÁCH HIỂN THỊ --- */}
        <div className="relative">
          {displayData.length === 0 && !isScanning ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <PackageSearch size={40} className="text-slate-200 mb-4" />
              <h3 className="text-slate-400 font-black uppercase text-sm tracking-widest">Warehouse is empty</h3>
            </div>
          ) : (
            <TagTable 
              tags={displayData} 
              allProducts={allProducts}
              onDeleteOne={deleteTag}
              onImport={handleImportProduct}
              onWriteClick={(tag) => setWriteModal({ open: true, tag })} // Gán sự kiện mở modal
            />
          )}
        </div>

        {/* --- POPUP WRITE EPC --- */}
        <WriteEpcModal 
          key={writeModal.tag?.epc} // THÊM DÒNG NÀY: Key thay đổi sẽ reset toàn bộ state của Modal
          isOpen={writeModal.open}
          oldEpc={writeModal.tag?.epc || ""}
          antenna={writeModal.tag?.antenna || 1}
          onClose={() => setWriteModal({ open: false, tag: null })}
          onConfirm={handleConfirmWrite}
        />


        <footer className="mt-12 flex justify-between text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
          <span>Protocol: Nation Hex</span>
          <span>RFID Lab System &copy; 2025</span>
        </footer>
      </div>
    </main>
  );
}