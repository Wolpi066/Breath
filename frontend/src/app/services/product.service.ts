import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { BannerData } from '../models/banner.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = environment.apiurl + 'products';
    private adminUrl = environment.apiurl + 'admin';
    // Base URL para imágenes subidas (ajusta si tu carpeta backend está en otro lado)
    private backendBaseUrl = 'http://localhost/Breath/backend/';

    private defaultBanners: BannerData = {
        banner1: 'assets/CARDS/calleNoche.jpg',
        banner2: 'assets/CARDS/wmremove-transformed.png'
    };

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Helper para arreglar URLs de imágenes
    private fixImageUrl(url: string): string {
        if (!url) return '';
        // Si ya es http o assets, la dejamos. Si es uploads/, le pegamos el dominio.
        if (url.startsWith('http') || url.startsWith('assets')) return url;
        return this.backendBaseUrl + url;
    }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map(products => {
                return products.map(p => ({
                    ...p,
                    price: Number(p.price),
                    discount: Number(p.discount),
                    sizes: p.sizes || [],
                    // Arreglamos las rutas de las imágenes al recibirlas
                    mainImage: this.fixImageUrl(p.mainImage),
                    hoverImage: this.fixImageUrl(p.hoverImage || '')
                }));
            })
        );
    }

    // ... (El resto de métodos CRUD queda igual, ya que envían la info correcta) ...
    createProduct(product: Product): Observable<any> {
        return this.http.post(this.apiUrl, product, { headers: this.authService.authHeaders });
    }

    updateProduct(product: Product): Observable<any> {
        return this.http.put(`${this.apiUrl}/${product.id}`, product, { headers: this.authService.authHeaders });
    }

    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.authHeaders });
    }

    resetDatabase(): Observable<any> {
        return this.http.post(`${this.adminUrl}/reset-db`, {}, { headers: this.authService.authHeaders });
    }

    getBanners(): BannerData {
        const saved = localStorage.getItem('breath-banners');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                banner1: this.fixImageUrl(parsed.banner1) || this.defaultBanners.banner1,
                banner2: this.fixImageUrl(parsed.banner2) || this.defaultBanners.banner2
            };
        }
        return this.defaultBanners;
    }

    saveBanners(banners: BannerData) {
        localStorage.setItem('breath-banners', JSON.stringify(banners));
    }
}