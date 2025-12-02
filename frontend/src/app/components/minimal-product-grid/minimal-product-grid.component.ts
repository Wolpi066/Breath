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
    @Output() cardClick = new EventEmitter<string>(); // ✅ NECESARIO PARA ABRIR EL DETALLE

    // --- LÓGICA DE DISTRIBUCIÓN RESTAURADA ---

    // Fila 1: Productos 0 al 3
    get firstRowProducts() {
        return this.adminProducts.slice(0, 4);
    }

    // Fila 2: Productos 4 al 7
    get secondRowProducts() {
        return this.adminProducts.slice(4, 8);
    }

    // Resto: Productos del 8 en adelante
    get remainingProducts() {
        return this.adminProducts.slice(8);
    }

    // Click en "COMPRAR"
    onAddToCartClick(productId: string) {
        this.addToCart.emit(productId);
    }

    // Click en la FOTO/TARJETA (Abre el detalle)
    onCardClick(productId: string) {
        this.cardClick.emit(productId);
    }
}