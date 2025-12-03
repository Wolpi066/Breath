import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MinimalProductCardComponent } from '../minimal-product-card/minimal-product-card.component';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-products-page',
    standalone: true, // ✅ CRÍTICO: Esto soluciona el error TS-992012
    imports: [CommonModule, FormsModule, MinimalProductCardComponent],
    // Asegúrate de que estos archivos existan con estos nombres exactos
    templateUrl: './products-page.components.html',
    styleUrls: ['./products-page.components.css']
})
export class ProductsPageComponent {

    _productsSignal = signal<Product[]>([]);
    _searchSignal = signal<string>('');

    @Input() set adminProducts(value: Product[]) {
        this._productsSignal.set(value);
    }

    @Input() set searchQuery(value: string) {
        this._searchSignal.set(value);
    }

    @Output() addToCart = new EventEmitter<string>();

    selectedCategories = signal<string[]>([]);
    selectedSizes = signal<string[]>([]);
    priceFrom = signal<number | null>(null);
    priceTo = signal<number | null>(null);
    isFilterOpen = signal(false);

    categories = [{ id: 'remeras', label: 'REMERAS' }, { id: 'buzos', label: 'BUZOS' }, { id: 'pantalones', label: 'PANTALONES' }, { id: 'gorras', label: 'GORRAS' }, { id: 'otro', label: 'OTRO' }];
    sizes = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

    filteredProducts = computed(() => {
        const products = this._productsSignal();
        const cats = this.selectedCategories();
        const sizes = this.selectedSizes();
        const min = this.priceFrom();
        const max = this.priceTo();
        const query = this._searchSignal().toLowerCase().trim();

        return products.filter(product => {
            const searchMatch = !query || product.name.toLowerCase().includes(query) || (product.description && product.description.toLowerCase().includes(query));
            const categoryMatch = cats.length === 0 || cats.includes(product.category);
            const sizeMatch = sizes.length === 0 || product.sizes.some(s => sizes.includes(s.size));
            const priceMatch = (min === null || product.price >= min) && (max === null || product.price <= max);
            return categoryMatch && sizeMatch && priceMatch && searchMatch;
        });
    });

    toggleCategory(catId: string) { this.selectedCategories.update(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]); }
    toggleSize(size: string) { this.selectedSizes.update(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]); }
    clearFilters() {
        this.selectedCategories.set([]);
        this.selectedSizes.set([]);
        this.priceFrom.set(null);
        this.priceTo.set(null);
    }
    onCardAddToCart(id: string) { this.addToCart.emit(id); }
}