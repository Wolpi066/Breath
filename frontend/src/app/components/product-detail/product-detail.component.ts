import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model'; // ✅ Usamos el modelo real
import { ReviewService } from '../../services/review.service'; // ✅ Importamos el servicio

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnChanges {
    // Inyección de dependencias
    private reviewService = inject(ReviewService);

    @Input({ required: true }) product!: Product;
    @Input() currentUser: string | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() addToCart = new EventEmitter<{ id: string, size: string, quantity: number }>();
    @Output() openCart = new EventEmitter<void>();

    selectedSize = signal<string | null>(null);
    quantity = signal(1);
    reviews = signal<Review[]>([]); // ✅ Tipado fuerte

    rating = 0;
    hoverRating = 0;
    comment = '';

    get isAdmin(): boolean { return this.currentUser === 'admin'; }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['product'] && this.product) {
            this.selectedSize.set(null);
            this.quantity.set(1);
            this.rating = 0;
            this.comment = '';
            this.loadReviews(); // ✅ Carga desde API
        }
    }

    incrementQty() { this.quantity.update(q => q + 1); }
    decrementQty() { this.quantity.update(q => (q > 1 ? q - 1 : 1)); }

    getStock(size: string): number {
        return this.product.sizes.find(s => s.size === size)?.stock || 0;
    }

    onAddToCartClick() {
        if (!this.selectedSize()) { alert('Por favor selecciona un talle'); return; }

        this.addToCart.emit({
            id: this.product.id,
            size: this.selectedSize()!,
            quantity: this.quantity()
        });
        this.openCart.emit();
    }

    // --- LÓGICA DE RESEÑAS CONECTADA AL BACKEND ---

    loadReviews() {
        this.reviewService.getReviews(this.product.id).subscribe({
            next: (data) => this.reviews.set(data),
            error: (err) => console.error('Error cargando reseñas:', err)
        });
    }

    submitReview() {
        if (!this.currentUser) return alert('Inicia sesión para opinar');
        if (this.rating === 0) return alert('Selecciona una calificación');
        if (!this.comment.trim()) return alert('Escribe un comentario');

        this.reviewService.createReview(this.product.id, this.rating, this.comment).subscribe({
            next: () => {
                this.loadReviews(); // Recargar lista
                this.rating = 0;
                this.comment = '';
            },
            error: (err) => alert(err.error?.error || 'Error al publicar')
        });
    }

    deleteReview(rid: string) {
        if (!confirm('¿Borrar reseña?')) return;

        this.reviewService.deleteReview(rid).subscribe({
            next: () => {
                this.loadReviews(); // Recargar lista tras borrar
            },
            error: (err) => alert(err.error?.error || 'Error al eliminar')
        });
    }
}