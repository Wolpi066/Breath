import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

export interface Review { id: string; username: string; rating: number; comment: string; date: string; }

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
    // ✅ EMITIMOS CANTIDAD
    @Output() addToCart = new EventEmitter<{ id: string, size: string, quantity: number }>();
    @Output() openCart = new EventEmitter<void>();

    selectedSize = signal<string | null>(null);
    quantity = signal(1); // ✅ NUEVO: Estado de cantidad
    reviews = signal<Review[]>([]);

    rating = 0; hoverRating = 0; comment = '';

    get isAdmin(): boolean { return this.currentUser === 'admin'; }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['product'] && this.product) {
            this.selectedSize.set(null);
            this.quantity.set(1); // Reset al cambiar producto
            this.loadReviews();
        }
    }

    // ✅ MÉTODOS PARA CANTIDAD
    incrementQty() { this.quantity.update(q => q + 1); }
    decrementQty() { this.quantity.update(q => (q > 1 ? q - 1 : 1)); }

    getStock(size: string): number {
        return this.product.sizes.find(s => s.size === size)?.stock || 0;
    }

    onAddToCartClick() {
        if (!this.selectedSize()) { alert('Por favor selecciona un talle'); return; }

        // ✅ EMITIMOS CON CANTIDAD
        this.addToCart.emit({
            id: this.product.id,
            size: this.selectedSize()!,
            quantity: this.quantity()
        });
        this.openCart.emit();
    }

    // ... (Resto de lógica de reseñas igual) ...
    loadReviews() {
        const key = `breath-reviews-${this.product.id}`;
        const saved = localStorage.getItem(key);
        this.reviews.set(saved ? JSON.parse(saved) : []);
    }
    submitReview() {
        if (!this.currentUser) return alert('Inicia sesión para opinar');
        if (this.rating === 0) return alert('Selecciona una calificación');
        if (!this.comment.trim()) return alert('Escribe un comentario');
        const newReview: Review = { id: Date.now().toString(), username: this.currentUser, rating: this.rating, comment: this.comment, date: new Date().toISOString() };
        const updated = [newReview, ...this.reviews()];
        this.reviews.set(updated);
        localStorage.setItem(`breath-reviews-${this.product.id}`, JSON.stringify(updated));
        this.rating = 0; this.comment = '';
    }
    deleteReview(rid: string) {
        if (!confirm('¿Borrar?')) return;
        const up = this.reviews().filter(r => r.id !== rid);
        this.reviews.set(up);
        localStorage.setItem(`breath-reviews-${this.product.id}`, JSON.stringify(up));
    }
}