import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

export interface Review {
    id: string; username: string; rating: number; comment: string; date: string;
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnChanges {
    @Input({ required: true }) product!: Product;
    @Input() currentUser: string | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() addToCart = new EventEmitter<{ id: string, size: string }>();
    @Output() openCart = new EventEmitter<void>();

    selectedSize = signal<string | null>(null);
    reviews = signal<Review[]>([]);

    // Formulario Reseña
    rating = 0;
    hoverRating = 0;
    comment = '';

    get isAdmin(): boolean { return this.currentUser === 'admin'; }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['product'] && this.product) {
            this.selectedSize.set(null);
            this.loadReviews();
        }
    }

    getStock(size: string): number {
        return this.product.sizes.find(s => s.size === size)?.stock || 0;
    }

    onAddToCartClick() {
        if (!this.selectedSize()) {
            alert('Por favor selecciona un talle'); return;
        }
        this.addToCart.emit({ id: this.product.id, size: this.selectedSize()! });
        this.openCart.emit();
    }

    // --- RESEÑAS ---
    loadReviews() {
        const key = `breath-reviews-${this.product.id}`;
        const saved = localStorage.getItem(key);
        this.reviews.set(saved ? JSON.parse(saved) : []);
    }

    submitReview() {
        if (!this.currentUser) return alert('Inicia sesión para opinar');
        if (this.rating === 0) return alert('Selecciona una calificación');
        if (!this.comment.trim()) return alert('Escribe un comentario');

        const newReview: Review = {
            id: Date.now().toString(),
            username: this.currentUser,
            rating: this.rating,
            comment: this.comment,
            date: new Date().toISOString()
        };

        const updated = [newReview, ...this.reviews()];
        this.reviews.set(updated);
        localStorage.setItem(`breath-reviews-${this.product.id}`, JSON.stringify(updated));

        this.rating = 0;
        this.comment = '';
    }

    deleteReview(reviewId: string) {
        if (!confirm('¿Borrar reseña?')) return;
        const updated = this.reviews().filter(r => r.id !== reviewId);
        this.reviews.set(updated);
        localStorage.setItem(`breath-reviews-${this.product.id}`, JSON.stringify(updated));
    }
}