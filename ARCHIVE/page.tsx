"use client";

import React, { useMemo } from 'react';
import { useSerialNation } from './hooks/useSerialNation';
import { TagTable } from './components/TagTable';
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
    tags, // Đây là Map chứa các EPC duy nhất đã quét được
    isScanning, 
    selectedAntennas,
    connect, 
    startScan, 
    stopScan, 
    toggleAntenna, 
    clearTags, 
    deleteTag 
  } = useSerialNation();
    
  // --- LOGIC QUAN TRỌNG: NHÓM THẺ THEO SẢN PHẨM ---
  // Chúng ta biến đổi Map<EPC, Tag> thành danh sách Sản phẩm kèm số lượng thẻ
  const displayData = useMemo(() => {
    const scannedTagsArray = Array.from(tags.values());
    
    const groups = scannedTagsArray.reduce((acc, tag) => {
      // KEY GOM NHÓM: 
      // - Nếu có ProductId: Dùng ProductId để gom (nhiều EPC cùng 1 sản phẩm)
      // - Nếu chưa đăng ký: Dùng chính EPC để hiện riêng từng thẻ chưa biết
      const isUnregistered = tag.productId === "unknown";
      const key = isUnregistered ? `unreg-${tag.epc}` : tag.productId;
      
      if (!acc[key]) {
        acc[key] = {
          ...tag,
          totalItems: 0,
          uniqueEpcs: new Set(),
        };
      }
      
      if (!acc[key].uniqueEpcs.has(tag.epc)) {
        acc[key].uniqueEpcs.add(tag.epc);
        acc[key].totalItems += 1; // Đây là con số 2, 3... bạn muốn thấy
      }

      // Luôn lấy Antenna và thời gian của lần đọc mới nhất
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
                <span className="text-sm font-bold text-slate-700">
                  {displayData.length} Loại sản phẩm
                </span>
              </div>
            </div>
            
            <button 
              onClick={clearTags}
              disabled={tags.size === 0}
              className="mt-4 md:mt-0 p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent"
              title="Xóa dữ liệu quét"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </header>

        {/* --- TRẠM ĐIỀU KHIỂN (CONTROL CENTER) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* Cài đặt kết nối & Anten */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-10">
            
            {/* Kết nối */}
            <div className="space-y-3">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Link size={14} /> Cổng tín hiệu
              </span>
              <button 
                onClick={connect} 
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  port 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'bg-slate-800 text-white hover:bg-slate-900'
                }`}
              >
                {port ? "✓ Đầu đọc đã sẵn sàng" : "Kết nối đầu đọc (COM)"}
              </button>
            </div>

            {/* Chọn Antenna */}
            <div className="space-y-3 flex-1 min-w-[240px]">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Radio size={14} /> Kích hoạt Antenna
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(id => (
                  <button
                    key={id}
                    disabled={isScanning}
                    onClick={() => toggleAntenna(id)}
                    className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center transition-all text-lg font-black ${
                      selectedAntennas.includes(id)
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    } ${isScanning ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Nút Lệnh Quyết định */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <button 
              onClick={startScan} 
              disabled={!port || isScanning || selectedAntennas.length === 0}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white h-24 rounded-2xl disabled:opacity-20 transition-all shadow-lg shadow-emerald-100"
            >
              <Play fill="currentColor" size={24} />
              <span className="font-bold uppercase text-[10px] tracking-widest">Bắt đầu quét</span>
            </button>

            <button 
              onClick={stopScan} 
              disabled={!isScanning}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white h-24 rounded-2xl disabled:opacity-20 transition-all shadow-lg shadow-rose-100"
            >
              <Square fill="currentColor" size={24} />
              <span className="font-bold uppercase text-[10px] tracking-widest">Dừng quét</span>
            </button>
          </div>
        </div>

        {/* --- DANH SÁCH SẢN PHẨM ĐÃ QUÉT --- */}
        <div className="relative">
          {isScanning && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full animate-bounce shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                ĐANG NHẬN TÍN HIỆU RFID...
              </div>
            </div>
          )}

          {/* Table Component */}
          {/* Ở đây tôi truyền displayData đã được NHÓM vào TagTable */}
          <TagTable tags={displayData} onDeleteOne={deleteTag} />
        </div>

        {/* --- EMPTY STATE --- */}
        {displayData.length === 0 && !isScanning && (
          <div className="mt-10 flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <PackageSearch size={64} className="text-slate-200 mb-4" />
            <h3 className="text-slate-400 font-bold">Chưa có dữ liệu quét</h3>
            <p className="text-slate-300 text-sm">Hãy kết nối cổng COM và bấm Bắt đầu để nhận diện hàng hóa</p>
          </div>
        )}

        {/* --- INFO FOOTER --- */}
        <footer className="mt-10 flex justify-between items-center text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}