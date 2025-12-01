import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model';
import { BannerData } from '../../models/banner.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnChanges {

    // ---------- INPUTS que vienen del padre (AppComponent) ----------
    @Input() products: Product[] = [];
    @Input() banners: BannerData = { banner1: '', banner2: '' };

    // ---------- OUTPUTS que escucha el padre ----------
    @Output() close = new EventEmitter<void>();
    @Output() saveProduct = new EventEmitter<Product>();
    @Output() deleteProduct = new EventEmitter<string>();
    @Output() saveBanners = new EventEmitter<BannerData>();

    // ---------- estado interno ----------
    activeTab: 'products' | 'banners' = 'products';

    filteredProducts: Product[] = [];
    searchTerm = '';
    categoryFilter = 'todos';

    isEditing = false;
    editingProduct: Product | null = null;

    banner1Preview: string | null = null;
    banner2Preview: string | null = null;

    // se inicializa desde los @Input
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['products']) {
            this.applyFilters();
        }

        if (changes['banners']) {
            this.banner1Preview = this.banners?.banner1 || null;
            this.banner2Preview = this.banners?.banner2 || null;
        }
    }

    // ======== UI helpers ========

    setTab(tab: 'products' | 'banners'): void {
        this.activeTab = tab;
    }

    getCategoryLabel(category: string): string {
        switch (category) {
            case 'remeras':
                return 'REMERAS';
            case 'buzos':
                return 'BUZOS';
            case 'pantalones':
                return 'PANTALONES';
            case 'gorras':
                return 'GORRAS';
            default:
                return 'OTRO';
        }
    }

    getSizesLabel(product: Product): string {
        if (!product || !product.sizes) return '';
        return product.sizes.map((s) => `${s.size}(${s.stock})`).join(', ');
    }

    // ======== filtros de productos ========

    applyFilters(): void {
        const list = this.products || [];

        this.filteredProducts = list.filter((p) => {
            const search = this.searchTerm.trim().toLowerCase();

            const name = p.name.toLowerCase();
            const description = (p.description || '').toLowerCase();

            const matchSearch =
                !search || name.includes(search) || description.includes(search);

            const matchCategory =
                this.categoryFilter === 'todos' || p.category === this.categoryFilter;

            return matchSearch && matchCategory;
        });
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onCategoryChange(category: string): void {
        this.categoryFilter = category;
        this.applyFilters();
    }

    // ======== ABM de productos ========

    newProduct(): void {
        this.isEditing = true;
        this.editingProduct = {
            id: '',
            name: '',
            description: '',
            category: 'remeras',
            price: 0,
            discount: 0,
            sizes: [
                { size: 'S', stock: 0 },
                { size: 'M', stock: 0 },
                { size: 'L', stock: 0 },
                { size: 'XL', stock: 0 },
            ],
            mainImage: '',
            hoverImage: '',
        };
    }

    editProduct(product: Product): void {
        this.isEditing = true;
        this.editingProduct = JSON.parse(JSON.stringify(product));
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.editingProduct = null;
    }

    // 🔹 ESTA función se llama desde el HTML
    // y emite el producto al padre
    onSaveProduct(): void {
        if (!this.editingProduct) return;

        if (!this.editingProduct.id) {
            this.editingProduct.id = Date.now().toString();
        }

        this.saveProduct.emit(this.editingProduct);

        this.isEditing = false;
        this.editingProduct = null;
    }

    onDeleteProduct(product: Product): void {
        if (!product || !product.id) return;
        this.deleteProduct.emit(product.id);
    }

    // ======== manejo de banners ========

    handleBannerUpload(event: Event, bannerKey: 'banner1' | 'banner2'): void {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            if (bannerKey === 'banner1') {
                this.banner1Preview = result;
            } else {
                this.banner2Preview = result;
            }
        };

        reader.readAsDataURL(file);
    }

    clearBanner(bannerKey: 'banner1' | 'banner2'): void {
        if (bannerKey === 'banner1') {
            this.banner1Preview = null;
        } else {
            this.banner2Preview = null;
        }
    }

    onSaveBanners(): void {
        const newBanners: BannerData = {
            banner1: this.banner1Preview || '',
            banner2: this.banner2Preview || '',
        };

        this.saveBanners.emit(newBanners);
    }

    // ======== cerrar modal ========

    onClose(): void {
        this.close.emit();
    }
}
