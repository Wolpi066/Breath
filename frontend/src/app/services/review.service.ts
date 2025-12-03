import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = environment.apiurl + 'reviews';
    private http = inject(HttpClient);
    private authService = inject(AuthService);

    getReviews(productId: string): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}?product_id=${productId}`);
    }

    createReview(productId: string, rating: number, comment: string): Observable<any> {
        const body = { product_id: productId, rating, comment };
        return this.http.post(this.apiUrl, body, { headers: this.authService.authHeaders });
    }

    deleteReview(reviewId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${reviewId}`, { headers: this.authService.authHeaders });
    }
}