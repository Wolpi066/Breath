import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-minimal-product-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './minimal-product-card.component.html',
    styleUrl: './minimal-product-card.component.css'
})
export class MinimalProductCardComponent implements OnChanges {
    @Input({ required: true }) id!: string;
    @Input({ required: true }) name!: string;
    @Input({ required: true }) price!: number;
    @Input({ required: true }) image!: string;

    @Input() originalPrice?: number;
    @Input() salePercentage?: number;
    @Input() installments = 3;

    @Output() addToCart = new EventEmitter<string>();

    currentImage: string = '';
    // Imagen de seguridad (asegúrate de que esta ruta exista o bórrala si no la quieres)
    fallbackImage = 'assets/CARDS/NEWstfu.png';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['image']) {
            this.currentImage = this.image;
        }
    }

    handleImageError() {
        if (this.currentImage !== this.fallbackImage) {
            this.currentImage = this.fallbackImage;
        }
    }

    // 👇 ESTA ES LA FUNCIÓN QUE FALTABA (Renombrada para coincidir con el HTML)
    onAddToCartClick(event: Event): void {
        event.stopPropagation(); // Evita que el click se propague si hubiera algo más
        this.addToCart.emit(this.id);
    }
}