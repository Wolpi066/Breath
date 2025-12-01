import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimalProductCardComponent } from '../minimal-product-card/minimal-product-card.component';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-minimal-product-grid',
    standalone: true,
    imports: [CommonModule, MinimalProductCardComponent], // Importamos la tarjeta aquí
    templateUrl: './minimal-product-grid.component.html',
    styleUrls: ['./minimal-product-grid.component.css']
})
export class MinimalProductGridComponent {
    @Input() adminProducts: Product[] = []; // Recibimos los productos
    @Input() banners: any = {}; // Ajusta el tipo si tienes interface de Banners

    @Output() addToCart = new EventEmitter<string>();

    // Getters para simular el slice de React (0-4, 4-8, etc.)
    get firstRowProducts() { return this.adminProducts.slice(0, 4); }
    get secondRowProducts() { return this.adminProducts.slice(4, 8); }
    get thirdRowProducts() { return this.adminProducts.slice(8, 12); }
    get remainingProducts() { return this.adminProducts.slice(12); }

    onCardClick(productId: string) {
        this.addToCart.emit(productId);
    }
}