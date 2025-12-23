"use client";

import React, { useState, useEffect } from 'react';
import { Storage, Category } from '../utils/storage';
import { Plus, Trash2, Edit3, Save, X, FolderTree } from 'lucide-react';

export default function CategoriesPage() {
    // 1. Khởi tạo state
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoaded, setIsLoaded] = useState(false); // Dùng để kiểm soát việc load dữ liệu lần đầu
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', parentId: '' });

    // 2. Chỉ load dữ liệu từ LocalStorage sau khi Component đã Mount (đã lên trình duyệt)
    useEffect(() => {
        const data = Storage.getCategories();
        setCategories(data);
        setIsLoaded(true); // Báo hiệu đã load xong để render giao diện
    }, []);

    // 3. Hàm lưu (Thêm/Sửa)
    const handleSave = () => {
        if (!formData.name.trim()) {
            alert("Vui lòng nhập tên danh mục");
            return;
        }
        
        let updatedList: Category[];
        
        if (isEditing) {
            // Trường hợp sửa
            updatedList = categories.map(cat => 
                cat.CategoryId === isEditing ? { ...cat, ...formData } : cat
            );
        } else {
            // Trường hợp thêm mới
            const newCat: Category = {
                CategoryId: crypto.randomUUID(), // Tạo ID duy nhất không trùng lặp
                name: formData.name,
                description: formData.description,
                parentId: formData.parentId
            };
            updatedList = [...categories, newCat];
        }

        // Lưu vào LocalStorage và cập nhật giao diện
        Storage.saveCategories(updatedList);
        setCategories(updatedList);
        
        // Reset form
        setFormData({ name: '', description: '', parentId: '' });
        setIsEditing(null);
    };

    // 4. Hàm xóa
    const handleDelete = (id: string) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            const updatedList = categories.filter(c => c.CategoryId !== id);
            Storage.saveCategories(updatedList);
            setCategories(updatedList);
        }
    };

    // 5. Nếu chưa load xong dữ liệu từ LocalStorage thì không render để tránh lỗi Hydration
    if (!isLoaded) return null;

    return (
        <main className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <FolderTree className="text-blue-600" size={32} />
                    <h1 className="text-3xl font-bold text-slate-800">Category Management</h1>
                </div>

                {/* --- FORM NHẬP LIỆU --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Tên danh mục</label>
                            <input
                                placeholder="VD: Đồ điện tử..."
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Mô tả ngắn</label>
                            <input
                                placeholder="Ghi chú thêm..."
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Danh mục cha</label>
                            <select
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                value={formData.parentId}
                                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                            >
                                <option value="">(Không có)</option>
                                {categories
                                    .filter(c => c.CategoryId !== isEditing) // Không cho phép chọn chính mình làm cha
                                    .map(cat => (
                                        <option key={cat.CategoryId} value={cat.CategoryId}>{cat.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button 
                            onClick={handleSave} 
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
                        >
                            {isEditing ? <Save size={18} /> : <Plus size={18} />}
                            {isEditing ? "Cập nhật thay đổi" : "Tạo danh mục mới"}
                        </button>
                        
                        {isEditing && (
                            <button 
                                onClick={() => { setIsEditing(null); setFormData({ name: '', description: '', parentId: '' }); }} 
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold transition-all"
                            >
                                <X size={18} /> Hủy sửa
                            </button>
                        )}
                    </div>
                </div>

                {/* --- BẢNG DANH SÁCH --- */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Tên danh mục</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Thuộc nhóm</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Mô tả</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-slate-400 italic">Chưa có danh mục nào được tạo.</td>
                                </tr>
                            ) : (
                                categories.map(cat => (
                                    <tr key={cat.CategoryId} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="p-4 font-bold text-slate-700">{cat.name}</td>
                                        <td className="p-4">
                                            {cat.parentId ? (
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-md font-medium">
                                                    {categories.find(c => c.CategoryId === cat.parentId)?.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-slate-500 text-sm">{cat.description || "..."}</td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(cat.CategoryId);
                                                        setFormData({ name: cat.name, description: cat.description, parentId: cat.parentId });
                                                    }} 
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.CategoryId)} 
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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