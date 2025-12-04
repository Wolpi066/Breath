export interface ProductSize {
    size: string;
    stock: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    sizes: ProductSize[];

    mainImage: string;
    image?: string;

    hoverImage?: string;

    discount?: number;
    salePercentage?: number;

    originalPrice?: number;
    description?: string;
}