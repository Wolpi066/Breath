import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { BannerData } from '../models/banner.model';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    // TODO: cambiá las rutas de imágenes por las reales en /assets
    private readonly INITIAL_PRODUCTS: Product[] = [
        {
            id: '1',
            name: 'HOODIE BREATHE MASK',
            description: 'Buzo con capucha diseño máscara y "breathe"',
            category: 'buzos',
            price: 85,
            discount: 0,
            sizes: [
                { size: 'S', stock: 7 },
                { size: 'M', stock: 11 },
                { size: 'L', stock: 9 },
                { size: 'XL', stock: 5 },
            ],
            mainImage: 'assets/buzo-breathe-mask.png',
            hoverImage: 'assets/buzo-breathe-mask.png',
        },
        {
            id: '2',
            name: 'HOODIE BREATHE ASTRONAUT',
            description: 'Buzo con capucha diseño "breathe" y astronauta rojo',
            category: 'buzos',
            price: 90,
            discount: 0,
            sizes: [
                { size: 'S', stock: 6 },
                { size: 'M', stock: 10 },
                { size: 'L', stock: 8 },
                { size: 'XL', stock: 4 },
            ],
            mainImage: 'assets/buzo-breathe-astronaut.png',
            hoverImage: 'assets/buzo-breathe-astronaut.png',
        },
        {
            id: '3',
            name: 'HOODIE HOPELESS STATUE',
            description: 'Buzo con capucha diseño "HOPELESS" y escultura clásica',
            category: 'buzos',
            price: 95,
            discount: 20,
            sizes: [
                { size: 'S', stock: 6 },
                { size: 'M', stock: 10 },
                { size: 'L', stock: 8 },
                { size: 'XL', stock: 5 },
            ],
            mainImage: 'assets/buzo-hopeless.png',
            hoverImage: 'assets/buzo-hopeless.png',
        },
        {
            id: '4',
            name: 'T-SHIRT PARADISE',
            description: 'Remera blanca "Another day in Paradise" con paisaje tropical',
            category: 'remeras',
            price: 40,
            discount: 0,
            sizes: [
                { size: 'S', stock: 10 },
                { size: 'M', stock: 15 },
                { size: 'L', stock: 12 },
                { size: 'XL', stock: 8 },
            ],
            mainImage: 'assets/remera-paradise.png',
            hoverImage: 'assets/remera-paradise.png',
        },
        {
            id: '5',
            name: 'HOODIE ROSWELL RECORD',
            description: 'Buzo con capucha diseño "Roswell Daily Record"',
            category: 'buzos',
            price: 90,
            discount: 15,
            sizes: [
                { size: 'S', stock: 6 },
                { size: 'M', stock: 10 },
                { size: 'L', stock: 8 },
                { size: 'XL', stock: 4 },
            ],
            mainImage: 'assets/buzo-roswell.png',
            hoverImage: 'assets/buzo-roswell.png',
        },
        {
            id: '6',
            name: 'HOODIE TRAGEDY',
            description: 'Buzo con capucha "Thank you for the tragedy"',
            category: 'buzos',
            price: 85,
            discount: 0,
            sizes: [
                { size: 'S', stock: 8 },
                { size: 'M', stock: 12 },
                { size: 'L', stock: 10 },
                { size: 'XL', stock: 6 },
            ],
            mainImage: 'assets/buzo-tragedy.png',
            hoverImage: 'assets/buzo-tragedy.png',
        },
        {
            id: '7',
            name: 'T-SHIRT WHO SHOT CUPID WHITE',
            description: 'Remera blanca "who shot cupid?" con cupido atravesado',
            category: 'remeras',
            price: 42,
            discount: 10,
            sizes: [
                { size: 'S', stock: 12 },
                { size: 'M', stock: 18 },
                { size: 'L', stock: 14 },
                { size: 'XL', stock: 10 },
            ],
            mainImage: 'assets/remera-cupid-white.png',
            hoverImage: 'assets/remera-cupid-white.png',
        },
        {
            id: '8',
            name: 'T-SHIRT LAST HIT',
            description: 'Remera negra "last hit" con pintura renacentista de cupido',
            category: 'remeras',
            price: 45,
            discount: 0,
            sizes: [
                { size: 'S', stock: 10 },
                { size: 'M', stock: 16 },
                { size: 'L', stock: 12 },
                { size: 'XL', stock: 8 },
            ],
            mainImage: 'assets/remera-last-hit.png',
            hoverImage: 'assets/remera-last-hit.png',
        },
        {
            id: '9',
            name: 'T-SHIRT WHO SHOT CUPID BLACK',
            description: 'Remera negra "who shot cupid?" con cupido atravesado',
            category: 'remeras',
            price: 42,
            discount: 0,
            sizes: [
                { size: 'S', stock: 14 },
                { size: 'M', stock: 20 },
                { size: 'L', stock: 16 },
                { size: 'XL', stock: 12 },
            ],
            mainImage: 'assets/remera-cupid-black.png',
            hoverImage: 'assets/remera-cupid-black.png',
        },
        {
            id: '10',
            name: 'CAP BREATHE WHITE',
            description: 'Gorra blanca con bordado "breathe"',
            category: 'gorras',
            price: 30,
            discount: 0,
            sizes: [{ size: 'Única', stock: 25 }],
            mainImage: 'assets/gorra-breathe-white.png',
            hoverImage: 'assets/gorra-breathe-white.png',
        },
        {
            id: '11',
            name: 'CAP BREATHE BLACK',
            description: 'Gorra negra con bordado "breathe"',
            category: 'gorras',
            price: 30,
            discount: 0,
            sizes: [{ size: 'Única', stock: 30 }],
            mainImage: 'assets/gorra-breathe-black.png',
            hoverImage: 'assets/gorra-breathe-black.png',
        },
    ];

    private _products: Product[] = structuredClone(this.INITIAL_PRODUCTS);

    private _banners: BannerData = {
        banner1: 'assets/banner-1.png',
        banner2: 'assets/banner-2.png',
    };

    // getters (por si algún archivo viejo los usa)
    get products(): Product[] {
        return this._products;
    }

    get banners(): BannerData {
        return this._banners;
    }

    // métodos nuevos
    getProducts(): Product[] {
        return this._products;
    }

    getBanners(): BannerData {
        return this._banners;
    }

    getProductById(id: string): Product | undefined {
        return this._products.find((p) => p.id === id);
    }

    saveProduct(product: Product): void {
        const idx = this._products.findIndex((p) => p.id === product.id);
        if (idx >= 0) {
            this._products[idx] = product;
        } else {
            this._products.push(product);
        }
    }

    deleteProduct(id: string): void {
        this._products = this._products.filter((p) => p.id !== id);
    }

    saveBanners(banners: BannerData): void {
        this._banners = banners;
    }
}
