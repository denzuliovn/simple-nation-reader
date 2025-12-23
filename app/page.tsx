"use client";
import React, { useMemo, useState, useEffect } from 'react';
import { useSerialNation } from './hooks/useSerialNation';
import { TagTable } from './components/TagTable';
import { Storage, Product } from './utils/storage';
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
    deleteTag 
  } = useSerialNation();

  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    setAllProducts(Storage.getProducts());
  }, [tags, isScanning]);

  // Hàm xử lý Import nhanh từ bảng
  const handleImportProduct = (epc: string, productId: string) => {
    if (!productId) return;
    Storage.addTag(epc, productId);
    alert(`Đã liên kết mã EPC ${epc.slice(-4)}... với sản phẩm thành công!`);
  };

  const displayData = useMemo(() => {
    const scannedArray = Array.from(tags.values());
    
    const groups = scannedArray.reduce((acc, tag) => {
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
                <span className="text-sm font-bold text-slate-700">
                  {displayData.length} Loại hàng hóa
                </span>
              </div>
            </div>
            
            <button 
              onClick={clearTags}
              disabled={tags.size === 0}
              className="mt-4 md:mt-0 p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent"
              title="Xóa kết quả quét"
            >
              <Trash2 size={24} />
            </button>
          </div>
        </header>

        {/* --- CONTROL PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Cổng Kết nối & Anten */}
          <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex flex-wrap items-center gap-10">
            
            {/* Kết nối */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Link size={14} /> PORT status
              </span>
              <button 
                onClick={connect} 
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-sm ${
                  port 
                  ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                  : 'bg-slate-800 text-white hover:bg-slate-900 active:scale-95'
                }`}
              >
                {port ? "✓ CONNECTED" : "SELECT COM PORT"}
              </button>
            </div>

            {/* Chọn Antenna */}
            <div className="space-y-3 flex-1 min-w-[240px]">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Radio size={14} /> Antenna selection
              </span>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map(id => (
                  <button
                    key={id}
                    disabled={isScanning}
                    onClick={() => toggleAntenna(id)}
                    className={`flex-1 h-12 rounded-2xl border-2 flex items-center justify-center transition-all text-lg font-black ${
                      selectedAntennas.includes(id)
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    } ${isScanning ? 'opacity-40 cursor-not-allowed' : 'active:scale-90'}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Lệnh Quét */}
          <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 flex items-center gap-4">
            <button 
              onClick={startScan} 
              disabled={!port || isScanning || selectedAntennas.length === 0}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white h-28 rounded-3xl disabled:opacity-20 transition-all shadow-xl shadow-emerald-100 active:scale-95"
            >
              <Play fill="currentColor" size={24} />
              <span className="font-black uppercase text-[10px] tracking-widest">Start scan</span>
            </button>

            <button 
              onClick={stopScan} 
              disabled={!isScanning}
              className="flex-1 flex flex-col items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white h-28 rounded-3xl disabled:opacity-20 transition-all shadow-xl shadow-rose-100 active:scale-95"
            >
              <Square fill="currentColor" size={24} />
              <span className="font-black uppercase text-[10px] tracking-widest">Stop scan</span>
            </button>
          </div>
        </div>

        {/* --- DANH SÁCH HIỂN THỊ --- */}
        <div className="relative">
          {isScanning && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
              <div className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full animate-bounce shadow-2xl flex items-center gap-2 border-2 border-white">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                RECEIVING SIGNAL FROM ANTENNA...
              </div>
            </div>
          )}

          {/* Nếu không có dữ liệu thì hiện màn hình trống */}
          {displayData.length === 0 && !isScanning ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <PackageSearch size={40} className="text-slate-200" />
              </div>
              <h3 className="text-slate-400 font-black uppercase text-sm tracking-widest">Warehouse is empty</h3>
              <p className="text-slate-300 text-xs mt-1">Connect COM port and click Start to begin inventory</p>
            </div>
          ) : (
            <TagTable 
              tags={displayData} 
              allProducts={allProducts}
              onDeleteOne={deleteTag}
              onImport={handleImportProduct}
            />
          )}
        </div>

        {/* --- FOOTER STATUS --- */}
        <footer className="mt-12 flex justify-between items-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> 
              Baudrate: 115200
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> 
              Protocol: Nation Hex
            </div>
          </div>
          <div className="hover:text-blue-400 transition-colors cursor-default">
            RFID Lab System &copy; 2025
          </div>
        </footer>
      </div>
    </main>
  );
}