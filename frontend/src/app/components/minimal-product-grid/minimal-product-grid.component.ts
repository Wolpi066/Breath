import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimalProductCardComponent } from '../minimal-product-card/minimal-product-card.component';
import { Product } from '../../models/product.model';
import { BannerData } from '../../models/banner.model';

@Component({
    selector: 'app-minimal-product-grid',
    standalone: true,
    imports: [CommonModule, MinimalProductCardComponent],
    templateUrl: './minimal-product-grid.component.html',
    styleUrls: ['./minimal-product-grid.component.css']
})
export class MinimalProductGridComponent {
    @Input() adminProducts: Product[] = [];
    @Input() banners: BannerData = { banner1: '', banner2: '' };

    @Output() addToCart = new EventEmitter<string>();
    @Output() cardClick = new EventEmitter<string>();

    // --- LÓGICA DE DISTRIBUCIÓN PERSONALIZADA ---

    get secondRowProducts() {
        const remeras = this.adminProducts.filter(p => p.category.toLowerCase() === 'remeras');
        return remeras.slice(0, 4);
    }

    get firstRowProducts() {
        const nonRemeras = this.adminProducts.filter(p => p.category.toLowerCase() !== 'remeras');
        return nonRemeras.slice(0, 4);
    }

    get remainingProducts() {
        const shownIds = [
            ...this.firstRowProducts.map(p => p.id),
            ...this.secondRowProducts.map(p => p.id)
        ];

        return this.adminProducts.filter(p => !shownIds.includes(p.id));
    }

    // Eventos
    onAddToCartClick(productId: string) {
        this.addToCart.emit(productId);
    }

    onCardClick(productId: string) {
        this.cardClick.emit(productId);
    }
}