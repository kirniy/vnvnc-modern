export interface ProductVariant {
    id: string;
    name: string;
    price: number;
    inStock: boolean;
}

export interface Coupon {
    code: string;
    discountType: 'percent' | 'fixed';
    value: number;
    minAmount?: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    images: string[];
    variants: ProductVariant[];
    tags: string[];
}

export const coupons: Coupon[] = [
    { code: 'VNVNC2025', discountType: 'percent', value: 10 },
    { code: 'FRIENDS', discountType: 'fixed', value: 500, minAmount: 3000 },
];

export const products: Product[] = [
    {
        id: 'hoodie-red-2025',
        name: 'худи red (hoodie red)',
        description: 'материал: хлопок 100% (cotton 100%). лимитированная коллекция 2025.',
        images: [
            '/merch/VNVNC-15.webp', '/merch/VNVNC-16.webp', '/merch/VNVNC-17.webp', '/merch/VNVNC-18.webp',
            '/merch/VNVNC-36.webp', '/merch/VNVNC-37.webp', '/merch/VNVNC-41.webp', '/merch/VNVNC-42.webp',
            '/merch/VNVNC-43.webp', '/merch/VNVNC-44.webp'
        ],
        tags: ['clothes', 'new'],
        variants: [
            { id: 'hr-m', name: 'M', price: 5000, inStock: true },
            { id: 'hr-l', name: 'L', price: 5000, inStock: true },
        ]
    },
    {
        id: 'hoodie-blue-2025',
        name: 'худи blue (hoodie blue)',
        description: 'материал: хлопок 100% (cotton 100%). лимитированная коллекция 2025.',
        images: [
            '/merch/VNVNC-19.webp', '/merch/VNVNC-20.webp', '/merch/VNVNC-21.webp', '/merch/VNVNC-22.webp',
            '/merch/VNVNC-23.webp', '/merch/VNVNC-45.webp', '/merch/VNVNC-46.webp'
        ],
        tags: ['clothes', 'new'],
        variants: [
            { id: 'hb-m', name: 'M', price: 5000, inStock: true },
            { id: 'hb-l', name: 'L', price: 5000, inStock: true },
        ]
    },
    {
        id: 't-shirt-blue-2025',
        name: 'футболка blue (t-shirt blue)',
        description: 'материал: хлопок 100% (cotton 100%). лимитированная коллекция 2025.',
        images: [
            '/merch/VNVNC-1.jpg', '/merch/VNVNC-2.webp', '/merch/VNVNC-4.webp', '/merch/VNVNC-5.webp',
            '/merch/VNVNC-6.webp', '/merch/VNVNC-9.webp', '/merch/VNVNC-12.webp', '/merch/VNVNC-13.webp',
            '/merch/VNVNC-14.webp', '/merch/VNVNC-29.webp', '/merch/VNVNC-31.webp', '/merch/VNVNC-34.webp',
            '/merch/VNVNC-38.webp', '/merch/VNVNC-39.webp', '/merch/VNVNC-40.webp', '/merch/VNVNC-47.webp',
            '/merch/VNVNC-48.webp', '/merch/VNVNC-58.webp', '/merch/VNVNC-60.webp'
        ],
        tags: ['clothes'],
        variants: [
            { id: 'tsb-m', name: 'M', price: 2500, inStock: true },
            { id: 'tsb-l', name: 'L', price: 2500, inStock: true },
        ]
    },
    {
        id: 't-shirt-pink-2025',
        name: 'футболка pink (t-shirt pink)',
        description: 'материал: хлопок 100% (cotton 100%). лимитированная коллекция 2025.',
        images: [
            '/merch/VNVNC-7.webp', '/merch/VNVNC-8.webp', '/merch/VNVNC-10.webp', '/merch/VNVNC-11.webp',
            '/merch/VNVNC-30.webp', '/merch/VNVNC-32.jpg', '/merch/VNVNC-33.jpg', '/merch/VNVNC-35.webp',
            '/merch/VNVNC-59.webp'
        ],
        tags: ['clothes', 'new'],
        variants: [
            { id: 'tsp-m', name: 'M', price: 2500, inStock: true },
            { id: 'tsp-l', name: 'L', price: 2500, inStock: true },
        ]
    },
    {
        id: 'gloves-2025',
        name: 'перчатки (gloves)',
        description: 'материал: хлопок 100% (cotton 100%).',
        images: [
            '/merch/VNVNC-24.webp', '/merch/VNVNC-25.webp', '/merch/VNVNC-26.webp', '/merch/VNVNC-27.webp',
            '/merch/VNVNC-28.webp', '/merch/VNVNC-51.webp', '/merch/VNVNC-52.webp', '/merch/VNVNC-53.webp',
            '/merch/VNVNC-54.webp', '/merch/VNVNC-55.webp', '/merch/VNVNC-56.webp'
        ],
        tags: ['accessories'],
        variants: [
            { id: 'gloves-one', name: 'One Size', price: 500, inStock: true },
        ]
    },
    {
        id: 'pendant-2025',
        name: 'подвеска (jewelry pendant)',
        description: 'материал: нержавеющая сталь (stainless steel).',
        images: [
            '/merch/VNVNC-49.webp', '/merch/VNVNC-50.webp', '/merch/VNVNC-57.jpg'
        ],
        tags: ['accessories'],
        variants: [
            { id: 'pendant-one', name: 'One Size', price: 1500, inStock: true },
        ]
    },
    {
        id: 'sticker-pack-2025',
        name: 'стикер‑пак (sticker pack)',
        description: 'набор наклеек с фирменной айдентикой vnvnc.',
        images: ['/merch/VNVNC-88.jpg'],
        tags: ['accessories'],
        variants: [
            { id: 'stickers-one', name: 'One Size', price: 200, inStock: true },
        ]
    }
];

export const tagTranslations: Record<string, string> = {
    'clothes': 'одежда',
    'accessories': 'аксессуары',
    'underwear': 'белье',
    'new': 'новинка',
    'bestseller': 'хит',
    'limited': 'лимитед'
};
