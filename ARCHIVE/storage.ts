// utils/storage.ts

export interface Category {
    CategoryId: string;
    name: string;
    description: string;
    parentId: string;
}

export interface Product {
    ProductId: string;
    name: string;
    unit: string;
    categoryId: string;
}

export interface Tag {
    epc: string;
    tid: string;
    status: string;
    productId: string;
}

const KEYS = {
    CAT: 'rfid_categories',
    PROD: 'rfid_products',
    TAG: 'rfid_tags'
};

export const Storage = {
    getCategories: () => JSON.parse(localStorage.getItem(KEYS.CAT) || '[]') as Category[],
    saveCategories: (d: Category[]) => localStorage.setItem(KEYS.CAT, JSON.stringify(d)),

    getProducts: () => JSON.parse(localStorage.getItem(KEYS.PROD) || '[]') as Product[],
    saveProducts: (d: Product[]) => localStorage.setItem(KEYS.PROD, JSON.stringify(d)),

    getTags: () => JSON.parse(localStorage.getItem(KEYS.TAG) || '[]') as Tag[],
    saveTags: (d: Tag[]) => localStorage.setItem(KEYS.TAG, JSON.stringify(d)),
};
