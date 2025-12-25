"use client";
import React, { useState } from 'react';
import { X, Save, Edit3, Fingerprint } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  oldEpc: string;
  antenna: number;
  onConfirm: (newEpc: string) => void;
}

export function WriteEpcModal({ isOpen, onClose, oldEpc, antenna, onConfirm }: Props) {
  const [newEpc, setNewEpc] = useState(oldEpc);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2">
            <Edit3 size={18} className="text-blue-600" /> Write Tag EPC
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-all active:scale-90">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Fingerprint size={12} /> Target Tag (Old EPC)
            </label>
            <div className="p-4 bg-slate-50 rounded-2xl font-mono text-xs text-slate-400 break-all border border-slate-100">
              {oldEpc}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antenna Use</label>
                <div className="text-sm font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 w-fit">
                    ANT {antenna}
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Identity (Hex Code)</label>
            <input 
              autoFocus
              className="w-full p-5 border-2 border-blue-50 rounded-3xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 font-mono text-blue-700 bg-blue-50/20 transition-all uppercase placeholder:text-slate-300"
              value={newEpc}
              onChange={(e) => setNewEpc(e.target.value.toUpperCase().replace(/[^0-9A-F]/g, ''))}
              placeholder="FFFFFFFF..."
              maxLength={24}
            />
            <div className="flex justify-between items-center px-2">
                <p className="text-[9px] text-slate-400 font-bold italic">Standard: 96-bit (24 chars)</p>
                <p className="text-[9px] font-black text-blue-400">{newEpc.length}/24</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition-all text-xs uppercase"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
                if(newEpc.length % 4 !== 0) {
                return alert("EPC length must be a multiple of 4 characters (1 Word = 2 Bytes)");
                }
                onConfirm(newEpc);
            }}
            className="flex-2 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 text-xs uppercase"
          >
            <Save size={16} /> Execute Write
          </button>
        </div>
      </div>
    </div>
  );
}