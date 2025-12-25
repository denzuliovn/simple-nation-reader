"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useSerialNation } from '../hooks/useSerialNation';
import { Storage, Product } from '../utils/storage';
import { 
  Zap, 
  Play, 
  Square, 
  Package, 
  Link,
  ChevronRight,
  Database
} from 'lucide-react';

export default function AutoImportPage() {
  const { 
    port, tags, isScanning, selectedAntennas,
    connect, startScan, stopScan, toggleAntenna, clearTags 
  } = useSerialNation();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [sessionLog, setSessionLog] = useState<{epc: string, status: string}[]>([]);
  const processedEpcs = useRef<Set<string>>(new Set());

  useEffect(() => {
    setAllProducts(Storage.getProducts());
  }, []);

  useEffect(() => {
    if (isScanning && selectedProductId) {
      const scannedEpcs = Array.from(tags.keys());
      
      scannedEpcs.forEach(epc => {
        // Nếu EPC này chưa được xử lý TRONG PHIÊN NÀY
        if (!processedEpcs.current.has(epc)) {
          const isNew = Storage.autoAddTag(epc, selectedProductId);
          
          setSessionLog(prev => [{
            epc,
            status: isNew ? "SUCCESS" : "ALREADY EXISTS"
          }, ...prev.slice(0, 49)]); 

          processedEpcs.current.add(epc);
        }
      });
    }
  }, [tags, isScanning, selectedProductId]);

  const handleStart = () => {
    if (!selectedProductId) return alert("Please select a product first!");
    processedEpcs.current.clear(); 
    setSessionLog([]);
    clearTags();
    startScan();
  };

  return (
    <main className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-10 flex justify-between items-end pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
              <Zap className="text-blue-600" fill="currentColor" size={32} />  
              AUTO <span className="text-blue-600 uppercase">Import</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
             <Database size={16} className="text-blue-500" />
             <span className="text-sm font-black text-slate-700">
               {allProducts.length} products
             </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: CẤU HÌNH */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Block 1: Chọn sản phẩm mục tiêu */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Package size={16} className="font-bold" />
                <span className="text-[10px] font-black uppercase tracking-widest">Target Product</span>
              </div>
              
              <select 
                className="w-full p-4 border-2 border-slate-50 rounded-2xl bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all font-black text-slate-700 appearance-none cursor-pointer"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                disabled={isScanning}
              >
                <option value="">-- CHOOSE PRODUCT --</option>
                {allProducts.map(p => (
                  <option key={p.ProductId} value={p.ProductId}>{p.name}</option>
                ))}
              </select>

              {selectedProductId && (
                 <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                 </div>
              )}
            </div>

            {/* Block 2: Kết nối thiết bị */}
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-slate-400">
                <Link size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Peripheral Devices</span>
              </div>
              
              <button 
                onClick={connect}
                className={`w-full py-3 rounded-2xl font-black text-xs mb-4 transition-all border-2 ${
                  port 
                  ? 'bg-blue-50 text-blue-600 border-blue-100' 
                  : 'bg-slate-900 text-white border-slate-900 shadow-lg'
                }`}
              >
                {port ? "✓ READER IS READY" : "CONNECT COM PORT"}
              </button>

              <div className="flex gap-2">
                {[1, 2, 3, 4].map(id => (
                  <button
                    key={id}
                    onClick={() => toggleAntenna(id)}
                    disabled={isScanning}
                    className={`flex-1 h-12 rounded-xl border-2 font-black transition-all ${
                      selectedAntennas.includes(id) 
                      ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100' 
                      : 'border-slate-50 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            {/* Block 3: Hành động */}
            <div className="flex gap-4">
              <button 
                onClick={handleStart}
                disabled={!port || isScanning || !selectedProductId}
                className="flex-1 h-24 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-100 disabled:opacity-20 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Play fill="currentColor" size={24} />
                <span className="text-[10px] tracking-[0.2em] uppercase font-black">Start Import</span>
              </button>

              <button 
                onClick={stopScan}
                disabled={!isScanning}
                className="flex-1 h-24 bg-rose-500 hover:bg-rose-600 text-white rounded-[2rem] font-black shadow-xl shadow-rose-100 disabled:opacity-20 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Square fill="currentColor" size={24} />
                <span className="text-[10px] tracking-[0.2em] uppercase font-black">Stop Import</span>
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: CONSOLE LOGS */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl h-[650px] flex flex-col overflow-hidden border-[6px] border-slate-800">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                   <span className="text-white font-black text-xs uppercase tracking-widest">Live Import Console</span>
                </div>
                <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                  {isScanning ? 'Status: Processing' : 'Status: Standby'}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-3 font-mono">
                {sessionLog.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-700 italic text-sm">
                    <Zap size={48} className="mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-widest opacity-20">Waiting for RFID signals...</p>
                  </div>
                )}
                {sessionLog.map((log, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 group animate-in slide-in-from-left duration-300">
                    <div className="flex items-center gap-4">
                      <div className="text-slate-600 text-[10px] font-black">{(sessionLog.length - i).toString().padStart(3, '0')}</div>
                      <div className="text-blue-400 text-sm font-black tracking-tight">{log.epc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ChevronRight size={14} className="text-slate-700" />
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border ${
                        log.status === 'THÀNH CÔNG' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-slate-800/80 border-t border-slate-800 flex justify-center items-center">
                 <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total tags added:</span>
                    <span className="text-white font-black text-lg leading-none">{processedEpcs.current.size}</span>
                 </div>
              </div>
            </div>
          </div>

        </div>

        {/* Status Footer */}
        <div className="mt-10 text-center">
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Automated RFID Mapping Logic v1.0</p>
        </div>

      </div>
    </main>
  );
}