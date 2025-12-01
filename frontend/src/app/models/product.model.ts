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
    image?: string; // Opcional (legacy)

    // 👇 AGREGA ESTA LÍNEA AQUÍ
    hoverImage?: string;

    discount?: number;
    salePercentage?: number; // Opcional (legacy)

    originalPrice?: number;
    description?: string;
}