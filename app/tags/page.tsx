"use client";
import React, { useState, useEffect } from 'react';
import { Storage, Tag, Product } from '../utils/storage';
import { Trash2, Edit3, Save, X, Tag as TagIcon, Fingerprint } from 'lucide-react';

export default function TagsPage() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        epc: '', tid: '', status: 'Active', type: 'UHF', productId: ''
    });

    useEffect(() => {
        setTags(Storage.getTags());
        setProducts(Storage.getProducts());
        setIsLoaded(true);
    }, []);

    const handleSave = () => {
        if (!formData.epc.trim()) {
            alert("Mã EPC là bắt buộc");
            return;
        }

        let updatedList: Tag[];
        const currentEpc = formData.epc.toUpperCase();

        if (isEditing) {
            updatedList = tags.map(t => 
                t.epc === isEditing ? { ...formData, epc: currentEpc } : t
            );
        } else {
            if (tags.some(t => t.epc === currentEpc)) {
                alert("Mã EPC này đã tồn tại trong hệ thống");
                return;
            }
            updatedList = [...tags, { ...formData, epc: currentEpc }];
        }

        Storage.saveTags(updatedList);
        setTags(updatedList);
        resetForm();
    };

    const handleDelete = (epc: string) => {
        if (window.confirm(`Xóa thẻ có mã EPC: ${epc}?`)) {
            const updatedList = tags.filter(t => t.epc !== epc);
            Storage.saveTags(updatedList);
            setTags(updatedList);
        }
    };

    const resetForm = () => {
        setFormData({ epc: '', tid: '', status: 'Active', type: 'UHF', productId: '' });
        setIsEditing(null);
    };

    if (!isLoaded) return null;

    return (
        <main className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <TagIcon className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-bold text-slate-800">Tag Management</h1>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">EPC</label>
                            <input
                                placeholder="E280..."
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                value={formData.epc}
                                onChange={e => setFormData({ ...formData, epc: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">TID</label>
                            <div className="relative">
                                <input
                                    placeholder="E200..."
                                    className="w-full p-2.5 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                                    value={formData.tid}
                                    onChange={e => setFormData({ ...formData, tid: e.target.value.toUpperCase() })}
                                />
                                <Fingerprint className="absolute left-3 top-3 text-slate-400" size={16} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Gán cho Sản phẩm</label>
                            <select
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                value={formData.productId}
                                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                            >
                                <option value="">Chọn sản phẩm mẫu...</option>
                                {products.map(p => <option key={p.ProductId} value={p.ProductId}>{p.name}</option>)}
                            </select>

                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Trạng thái</label>
                            <select
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Active">Đang hoạt động (Active)</option>
                                <option value="Inactive">Ngừng hoạt động (Inactive)</option>
                                <option value="Damaged">Đã hỏng (Damaged)</option>
                            </select>

                            <input 
                                value={formData.epc}
                                onChange={e => setFormData({...formData, epc: e.target.value.toUpperCase()})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Loại thẻ</label>
                            <select
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="UHF">Siêu cao tần (UHF)</option>
                                <option value="HF">Cao tần (HF/NFC)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg">
                            {isEditing ? <Save size={18} /> : <TagIcon size={18} />}
                            {isEditing ? "Cập nhật Tag" : "Đăng ký Tag"}
                        </button>
                        {isEditing && (
                            <button onClick={resetForm} className="flex items-center gap-2 bg-slate-100 px-6 py-2.5 rounded-xl font-bold">
                                <X size={18} /> Hủy
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">EPC / TID</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Product</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Loại / Trạng thái</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tags.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center text-slate-400 italic">Chưa có Tag nào được khai báo.</td></tr>
                            ) : (
                                tags.map(t => (
                                    <tr key={t.epc} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-sm font-bold text-blue-700">{t.epc}</div>
                                            <div className="font-mono text-[10px] text-slate-400">{t.tid || 'No TID'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm font-medium text-slate-700">
                                                {products.find(p => p.ProductId === t.productId)?.name || '—'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 italic">
                                                {products.find(p => p.ProductId === t.productId)?.unit || ''}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400">{t.type}</span>
                                                <span className={`w-fit px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    t.status === 'Active' ? 'bg-green-100 text-green-700' : 
                                                    t.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => {
                                                    setIsEditing(t.epc);
                                                    setFormData(t);
                                                }} className="p-2 text-slate-400 hover:text-blue-600"><Edit3 size={18} /></button>
                                                <button onClick={() => handleDelete(t.epc)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}