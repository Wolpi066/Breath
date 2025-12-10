import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnChanges {
    private reviewService = inject(ReviewService);
    private cartService = inject(CartService);

    @Input({ required: true }) product!: Product;
    @Input() currentUser: string | null = null;

    @Output() close = new EventEmitter<void>();

    @Output() addToCart = new EventEmitter<{ id: string, size: string, quantity: number, stock: number }>();
    @Output() openCart = new EventEmitter<void>();
    @Output() openAuth = new EventEmitter<void>();

    selectedSize = signal<string | null>(null);
    quantity = signal(1);
    reviews = signal<Review[]>([]);

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
            this.loadReviews();
        }
    }

    get effectiveStock(): number {
        const size = this.selectedSize();
        if (!size) return 0;

        const totalStock = this.product.sizes.find(s => s.size === size)?.stock || 0;
        const inCart = this.cartService.getQuantityInCart(this.product.id, size);

        return Math.max(0, totalStock - inCart);
    }

    incrementQty() {
        if (this.quantity() < this.effectiveStock) {
            this.quantity.update(q => q + 1);
        } else {
        }
    }

    decrementQty() { this.quantity.update(q => (q > 1 ? q - 1 : 1)); }

    getStock(size: string): number {
        return this.product.sizes.find(s => s.size === size)?.stock || 0;
    }

    onAddToCartClick() {
        const size = this.selectedSize();
        if (!size) { alert('Por favor selecciona un talle'); return; }

        const stockTotal = this.product.sizes.find(s => s.size === size)?.stock || 0;

        if (this.quantity() > this.effectiveStock) {
            alert('No hay suficiente stock disponible para agregar esa cantidad.');
            return;
        }

        this.addToCart.emit({
            id: this.product.id,
            size: size,
            quantity: this.quantity(),
            stock: stockTotal
        });

        this.quantity.set(1);
        this.openCart.emit();
    }

    onLoginClick() { this.openAuth.emit(); }

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
                this.loadReviews();
                this.rating = 0;
                this.comment = '';
            },
            error: (err) => alert(err.error?.error || 'Error al publicar')
        });
    }

    deleteReview(rid: string) {
        if (!confirm('¿Borrar reseña?')) return;
        this.reviewService.deleteReview(rid).subscribe({
            next: () => this.loadReviews(),
            error: (err) => alert(err.error?.error || 'Error al eliminar')
        });
    }
}