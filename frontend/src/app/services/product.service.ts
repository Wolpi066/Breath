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
    private apiUrl = environment.apiurl + 'products'; // http://localhost/Breath/backend/products

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // GET: Trae los datos de MySQL
    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.apiUrl).pipe(
            map(products => {
                // Aseguramos tipos numéricos
                return products.map(p => ({
                    ...p,
                    price: Number(p.price),
                    discount: Number(p.discount),
                    // Asegurar que sizes sea array (si viene null del back)
                    sizes: p.sizes || []
                }));
            })
        );
    }

    // POST: Crear (Requiere Token)
    createProduct(product: Product): Observable<any> {
        return this.http.post(this.apiUrl, product, { headers: this.authService.authHeaders });
    }

    // PUT: Editar (Requiere Token)
    updateProduct(product: Product): Observable<any> {
        return this.http.put(`${this.apiUrl}/${product.id}`, product, { headers: this.authService.authHeaders });
    }

    // DELETE: Borrar (Requiere Token)
    deleteProduct(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.authHeaders });
    }

    // Banners (Simulado por ahora hasta que hagas la tabla banners, usa LocalStorage para no perderlos)
    getBanners(): BannerData {
        const saved = localStorage.getItem('breath-banners');
        return saved ? JSON.parse(saved) : { banner1: '', banner2: '' };
    }

    saveBanners(banners: BannerData) {
        localStorage.setItem('breath-banners', JSON.stringify(banners));
    }
}