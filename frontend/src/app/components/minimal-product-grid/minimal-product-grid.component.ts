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
    // Recibimos los datos del padre (AppComponent)
    @Input() adminProducts: Product[] = [];
    @Input() banners: BannerData = { banner1: '', banner2: '' };

    @Output() addToCart = new EventEmitter<string>();

    // --- LÓGICA DE DISTRIBUCIÓN ---

    // 1. Primera Fila (Productos 0 al 3)
    get firstRowProducts() {
        return this.adminProducts.slice(0, 4);
    }

    // 2. Segunda Fila (Productos 4 al 7)
    get secondRowProducts() {
        return this.adminProducts.slice(4, 8);
    }

    // 3. Resto de Productos (Del 8 al final)
    get remainingProducts() {
        return this.adminProducts.slice(8);
    }

    // Evento click de la tarjeta
    onCardClick(productId: string) {
        this.addToCart.emit(productId);
    }
}