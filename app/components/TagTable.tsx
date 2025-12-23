import React, { useState } from 'react';
import { Trash2, Box, PlusCircle, CheckCircle } from 'lucide-react';
import { Product } from '../utils/storage';

interface Props {
  tags: any[];
  allProducts: Product[];
  onDeleteOne: (epc: string) => void;
  onImport: (epc: string, productId: string) => void;
}

export function TagTable({ tags, allProducts, onDeleteOne, onImport }: Props) {
  const [selections, setSelections] = useState<Record<string, string>>({});

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Product / EPC</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Antenna</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Quantity</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Warehouse Status</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tags.map((tag) => {
            const isUnknown = tag.productId === "unknown";
            
            return (
              <tr key={tag.epc} className="hover:bg-blue-50/20 transition-all group">
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isUnknown ? 'bg-amber-100 text-amber-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                      <Box size={20} />
                    </div>
                    <div>
                      <div className={`font-black text-sm ${isUnknown ? 'text-amber-700 italic' : 'text-slate-800'}`}>
                        {tag.productName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-tighter">
                        Mã EPC: {tag.epc}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="p-4 text-center">
                   <span className="text-[10px] font-black bg-slate-800 text-white px-2 py-0.5 rounded-md">ANT {tag.antenna}</span>
                </td>

                <td className="p-4 text-center">
                  <div className={`inline-flex flex-col items-center p-2 rounded-2xl border min-w-[65px] ${isUnknown ? 'bg-amber-50 border-amber-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className={`text-2xl font-black leading-none ${isUnknown ? 'text-amber-600' : 'text-blue-700'}`}>
                      {tag.totalItems || 1}
                    </div>
                    <div className={`text-[8px] font-black uppercase mt-1 ${isUnknown ? 'text-amber-400' : 'text-blue-400'}`}>
                      {tag.unit || 'Items'}
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  {isUnknown ? (
                    <div className="flex items-center gap-2">
                      <select 
                        className="text-[11px] p-2 border border-amber-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-amber-500 w-44 font-bold text-slate-600"
                        value={selections[tag.epc] || ""}
                        onChange={(e) => setSelections({...selections, [tag.epc]: e.target.value})}
                      >
                        <option value="">-- Gán sản phẩm --</option>
                        {allProducts.map(p => (
                          <option key={p.ProductId} value={p.ProductId}>{p.name}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => onImport(tag.epc, selections[tag.epc])}
                        disabled={!selections[tag.epc]}
                        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black px-3 py-2 rounded-xl transition-all disabled:opacity-30 shadow-md shadow-amber-100 uppercase"
                      >
                        <PlusCircle size={14} /> Import
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle size={16} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Đã khớp dữ liệu</span>
                    </div>
                  )}
                </td>

                <td className="p-4 text-center">
                  <button 
                    onClick={() => onDeleteOne(tag.epc)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}