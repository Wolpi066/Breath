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

    // FILA 2 (PRIORIDAD): Solo Remeras (4 unidades)
    get secondRowProducts() {
        // Filtramos solo las remeras
        const remeras = this.adminProducts.filter(p => p.category.toLowerCase() === 'remeras');
        // Devolvemos las 4 primeras (más nuevas)
        return remeras.slice(0, 4);
    }

    // FILA 1: Últimos Lanzamientos (SIN Remeras)
    get firstRowProducts() {
        // Filtramos todo lo que NO sea remera
        const nonRemeras = this.adminProducts.filter(p => p.category.toLowerCase() !== 'remeras');
        // Devolvemos los 4 primeros (más nuevos)
        return nonRemeras.slice(0, 4);
    }

    // RESTO: Todo lo que sobró (Remeras extra + Otros extra)
    get remainingProducts() {
        // Obtenemos los IDs que ya mostramos en las filas 1 y 2
        const shownIds = [
            ...this.firstRowProducts.map(p => p.id),
            ...this.secondRowProducts.map(p => p.id)
        ];

        // Devolvemos todo lo que no esté en esa lista de IDs
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