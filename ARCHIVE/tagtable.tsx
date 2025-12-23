// components/TagTable.tsx
import React from 'react';
import { Trash2, Box } from 'lucide-react';

// Định nghĩa kiểu dữ liệu cho tag được truyền vào từ displayData của page.tsx
interface TagRow {
  epc: string;
  antenna: number;
  productName: string;
  categoryName: string;
  unit: string;
  totalItems: number; // Đây là số lượng thẻ duy nhất của cùng 1 loại sản phẩm
  firstSeen: string;
  lastSeen: string;
  productId: string;
}

interface Props {
  tags: any[]; // Nhận displayData từ page.tsx
  onDeleteOne: (epc: string) => void;
}

export function TagTable({ tags, onDeleteOne }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Sản phẩm / EPC cuối</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Danh mục</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-center">Antenna</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-center">Số lượng</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Ghi nhận lần cuối</th>
            <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tags.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-20 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                    <Box size={24} />
                  </div>
                  <span className="text-slate-300 text-sm italic">Hệ thống đang sẵn sàng quét...</span>
                </div>
              </td>
            </tr>
          ) : (
            tags.map((tag: TagRow) => (
              <tr key={tag.epc} className="hover:bg-blue-50/30 transition-all group">
                {/* CỘT SẢN PHẨM */}
                <td className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tag.productId === 'unknown' ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-100'}`}>
                      <Box size={20} />
                    </div>
                    <div>
                      <div className={`font-black text-sm ${tag.productId === 'unknown' ? 'text-slate-400 italic' : 'text-slate-800'}`}>
                        {tag.productName}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5 tracking-tighter">
                        EPC: {tag.epc}
                      </div>
                    </div>
                  </div>
                </td>

                {/* CỘT DANH MỤC */}
                <td className="p-4">
                  <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-tight">
                    {tag.categoryName}
                  </span>
                </td>

                {/* CỘT ANTENNA */}
                <td className="p-4 text-center">
                   <span className="text-[10px] font-black bg-slate-800 text-white px-2.5 py-1 rounded-md">
                      ANT {tag.antenna}
                   </span>
                </td>

                {/* CỘT SỐ LƯỢNG (QUAN TRỌNG NHẤT) */}
                <td className="p-4 text-center">
                  <div className="inline-flex flex-col items-center min-w-[60px] p-2 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="text-2xl font-black text-blue-700 leading-none">
                      {tag.totalItems || 1}
                    </div>
                    <div className="text-[8px] font-black text-blue-400 uppercase mt-1">
                      {tag.unit || 'Sản phẩm'}
                    </div>
                  </div>
                </td>

                {/* CỘT THỜI GIAN */}
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <div className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[10px] font-bold">Đầu: {tag.firstSeen}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black">Cuối: {tag.lastSeen}</span>
                    </div>
                  </div>
                </td>

                {/* CỘT THAO TÁC */}
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onDeleteOne(tag.epc)}
                    className="p-2.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                    title="Xóa dòng này"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}