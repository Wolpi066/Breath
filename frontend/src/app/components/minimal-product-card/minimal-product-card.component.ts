import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-minimal-product-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './minimal-product-card.component.html',
    styleUrl: './minimal-product-card.component.css',
    host: {
        'class': 'block w-full h-full'
    }
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
    @Output() cardClick = new EventEmitter<string>();

    currentImage: string = '';
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

    // Click en el botón "COMPRAR"
    onAddToCartClick(event: Event): void {
        event.stopPropagation();
        this.addToCart.emit(this.id);
    }

    // Click en la imagen/tarjeta (para ver detalle)
    onCardClick(): void {
        this.cardClick.emit(this.id);
    }
}