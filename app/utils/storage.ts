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
    type: string;
    productId: string;
}

const KEYS = {
    CAT: 'rfid_cat',
    PROD: 'rfid_prod',
    TAG: 'rfid_tag_db'
};

export const Storage = {
    // --- CATEGORIES ---
    getCategories: () => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(KEYS.CAT) || '[]') as Category[];
    },
    saveCategories: (d: Category[]) => localStorage.setItem(KEYS.CAT, JSON.stringify(d)),

    // --- PRODUCTS ---
    getProducts: () => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(KEYS.PROD) || '[]') as Product[];
    },
    saveProducts: (d: Product[]) => localStorage.setItem(KEYS.PROD, JSON.stringify(d)),

    // --- TAGS (LIÊN KẾT EPC - PRODUCT) ---
    getTags: () => {
        if (typeof window === 'undefined') return [];
        return JSON.parse(localStorage.getItem(KEYS.TAG) || '[]') as Tag[];
    },
    saveTags: (d: Tag[]) => localStorage.setItem(KEYS.TAG, JSON.stringify(d)),

    // Hàm gán nhanh EPC vào Sản phẩm từ màn hình Scan
    addTag: (epc: string, productId: string) => {
        const tags = Storage.getTags();
        if (!tags.some(t => t.epc === epc)) {
            tags.push({
                epc: epc,
                productId: productId,
                tid: '',
                status: 'Active',
                type: 'UHF'
            });
            Storage.saveTags(tags);
        }
    },  

    autoAddTag: (epc: string, productId: string): boolean => {
        const tags = JSON.parse(localStorage.getItem('rfid_tag_db') || '[]') as Tag[];
        if (!tags.some(t => t.epc === epc)) {
            tags.push({
                epc: epc,
                productId: productId,
                tid: '',
                status: 'Active',
                type: 'UHF'
            });
            localStorage.setItem('rfid_tag_db', JSON.stringify(tags));
            return true; 
        }
        return false; 
    }
};