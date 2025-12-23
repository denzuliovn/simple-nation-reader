"use client";

import React, { useState, useEffect } from 'react';
import { Storage, Product, Category } from '../utils/storage';
import { Plus, Trash2, Edit3, Save, X, Package, Layers } from 'lucide-react';

export default function ProductsPage() {
    // --- STATE QUẢN LÝ ---
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({ 
        name: '', 
        unit: '', 
        categoryId: '' 
    });

    // --- LOAD DỮ LIỆU ---
    useEffect(() => {
        const productData = Storage.getProducts();
        const categoryData = Storage.getCategories();
        setProducts(productData);
        setCategories(categoryData);
        setIsLoaded(true);
    }, []);

    // --- XỬ LÝ LƯU (THÊM/SỬA) ---
    const handleSave = () => {
        if (!formData.name.trim()) {
            alert("Vui lòng nhập Tên sản phẩm");
            return;
        }

        let updatedList: Product[];

        if (isEditing) {
            // Cập nhật sản phẩm cũ
            updatedList = products.map(p => 
                p.ProductId === isEditing ? { ...p, ...formData } : p
            );
        } else {
            // Tạo sản phẩm mới (SKU)
            const newProd: Product = {
                ProductId: crypto.randomUUID(), // Tạo ID duy nhất
                name: formData.name,
                unit: formData.unit,
                categoryId: formData.categoryId
            };
            updatedList = [...products, newProd];
        }

        Storage.saveProducts(updatedList);
        setProducts(updatedList);
        resetForm();
    };

    // --- XỬ LÝ XÓA ---
    const handleDelete = (id: string) => {
        if (window.confirm("Xóa sản phẩm này sẽ làm mất liên kết với các thẻ (Tags) hiện có. Tiếp tục?")) {
            const updatedList = products.filter(p => p.ProductId !== id);
            Storage.saveProducts(updatedList);
            setProducts(updatedList);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', unit: '', categoryId: '' });
        setIsEditing(null);
    };

    // Tránh lỗi Hydration
    if (!isLoaded) return null;

    return (
        <main className="p-8 bg-slate-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                
                {/* Tiêu đề trang */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Product Management</h1>
                    </div>
                </div>

                {/* --- FORM NHẬP LIỆU --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Tên sản phẩm</label>
                            <input
                                placeholder="VD: Nước suối Aquafina 500ml..."
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Đơn vị tính</label>
                            <input
                                placeholder="VD: Chai, Lon, Thùng..."
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Nhóm danh mục</label>
                            <select
                                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(cat => (
                                    <option key={cat.CategoryId} value={cat.CategoryId}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t border-slate-50">
                        <button 
                            onClick={handleSave} 
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-100"
                        >
                            {isEditing ? <Save size={18} /> : <Plus size={18} />}
                            {isEditing ? "Cập nhật sản phẩm" : "Đăng ký sản phẩm"}
                        </button>
                        
                        {isEditing && (
                            <button onClick={resetForm} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold">
                                <X size={18} /> Hủy bỏ
                            </button>
                        )}
                    </div>
                </div>

                {/* --- BẢNG DANH SÁCH --- */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Sản phẩm</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">ĐVT</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider">Danh mục</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-wider text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Layers size={48} strokeWidth={1} />
                                            <p className="italic text-sm">Chưa có sản phẩm nào được tạo.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.ProductId} className="hover:bg-blue-50/20 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-700">{p.name}</div>
                                            <div className="text-[10px] text-slate-400 font-mono tracking-tight">{p.ProductId}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                                                {p.unit || '—'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md">
                                                {categories.find(c => c.CategoryId === p.categoryId)?.name || 'Chưa phân loại'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(p.ProductId);
                                                        setFormData({ 
                                                            name: p.name, 
                                                            unit: p.unit, 
                                                            categoryId: p.categoryId 
                                                        });
                                                    }} 
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Sửa thông tin"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(p.ProductId)} 
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Xóa sản phẩm"
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