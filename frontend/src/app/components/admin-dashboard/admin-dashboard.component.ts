import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model';
import { BannerData } from '../../models/banner.model';
import { MinimalProductCardComponent } from '../minimal-product-card/minimal-product-card.component';
import { ProductService } from '../../services/product.service';

export interface ProductSize { size: string; stock: number; }

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, MinimalProductCardComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnChanges {
    private productService = inject(ProductService);

    @Input() products: Product[] = [];
    @Input() banners: BannerData = { banner1: '', banner2: '' };
    @Output() close = new EventEmitter<void>();
    @Output() saveProduct = new EventEmitter<Product>();
    @Output() deleteProduct = new EventEmitter<string>();
    @Output() saveBanners = new EventEmitter<BannerData>();

    activeTab: 'productos' | 'banners' = 'productos';
    filteredProducts: Product[] = [];
    searchTerm = '';
    categoryFilter = 'todos';
    isEditing = false;
    editingProduct: Product | null = null;

    formData = signal<Partial<Product>>({ category: 'remeras', price: 0, discount: 0, sizes: [{ size: 'S', stock: 0 }] });
    mainImagePreview = signal<string | null>(null);
    hoverImagePreview = signal<string | null>(null);
    banner1Preview = signal<string | null>(null);
    banner2Preview = signal<string | null>(null);

    sizesOptions = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

    categoriesOptions = signal<string[]>([]); // Usar signal para reactividad

    ngOnInit() {
        this.productService.getCategories().subscribe({
            next: (cats) => this.categoriesOptions.set(cats),
            error: () => this.categoriesOptions.set(['remeras', 'buzos', 'otros']) // Fallback
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['products']) this.applyFilters();
        if (changes['banners']) {
            this.banner1Preview.set(this.banners?.banner1 || null);
            this.banner2Preview.set(this.banners?.banner2 || null);
        }
    }

    setTab(tab: 'productos' | 'banners'): void { this.activeTab = tab; this.cancelEdit(); }
    getCategoryLabel(category: string | undefined): string { return category?.toUpperCase() || 'OTRO'; }
    getSizesLabel(product: Product): string { return product.sizes?.map(s => `${s.size}(${s.stock})`).join(', ') || ''; }

    applyFilters(): void {
        const list = this.products || [];
        this.filteredProducts = list.filter((p) => {
            const search = this.searchTerm.trim().toLowerCase();
            const name = p.name.toLowerCase();
            const matchSearch = !search || name.includes(search);
            const matchCategory = this.categoryFilter === 'todos' || p.category === this.categoryFilter;
            return matchSearch && matchCategory;
        });
    }

    onCategoryChange(category: string): void { this.categoryFilter = category; this.applyFilters(); }

    newProduct(): void {
        this.isEditing = true;
        const newProd = { id: '', name: '', description: '', category: 'remeras', price: 0, discount: 0, sizes: [{ size: 'S', stock: 0 }], mainImage: '', hoverImage: '' };
        this.editingProduct = newProd as Product;
        this.formData.set(newProd);
        this.mainImagePreview.set(null);
        this.hoverImagePreview.set(null);
    }

    handleEdit(product: Product): void {
        this.isEditing = true;
        const copy = JSON.parse(JSON.stringify(product));
        this.editingProduct = copy;
        this.formData.set(copy);
        this.mainImagePreview.set(product.mainImage);
        this.hoverImagePreview.set(product.hoverImage ?? null);
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.editingProduct = null;
        this.mainImagePreview.set(null);
        this.hoverImagePreview.set(null);
    }

    handleImageUpload(event: Event, type: 'mainImage' | 'hoverImage' | 'banner1' | 'banner2') {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const base64String = reader.result as string;
            if (type === 'mainImage') { this.mainImagePreview.set(base64String); this.formData.update(d => ({ ...d, mainImage: base64String })); }
            else if (type === 'hoverImage') { this.hoverImagePreview.set(base64String); this.formData.update(d => ({ ...d, hoverImage: base64String })); }
            else if (type === 'banner1') { this.banner1Preview.set(base64String); }
            else if (type === 'banner2') { this.banner2Preview.set(base64String); }
        };
        reader.readAsDataURL(file);
    }

    handleAddSize() { this.formData.update(d => ({ ...d, sizes: [...(d.sizes || []), { size: 'M', stock: 0 } as ProductSize] })); }
    handleRemoveSize(index: number) { this.formData.update(d => ({ ...d, sizes: d.sizes?.filter((_, i) => i !== index) })); }
    handleUpdateSize(index: number, field: 'size' | 'stock', event: Event) { /* ... */ }

    handleSubmit(e: Event) {
        e.preventDefault();
        const data = this.formData();
        if (!data.name || data.price === undefined || !this.mainImagePreview()) { alert("Faltan campos requeridos."); return; }

        const finalProduct: Product = {
            ...this.editingProduct, ...data,
            id: this.editingProduct?.id || '',
            hoverImage: data.hoverImage || data.mainImage || '',
            description: data.description || '',
            mainImage: this.mainImagePreview() || ''
        } as Product;
        this.saveProduct.emit(finalProduct);
        this.cancelEdit();
    }

    handleDelete(id: string) { if (confirm('¿Eliminar?')) this.deleteProduct.emit(id); }

    handleSaveBanners() {
        const newBanners: BannerData = {
            banner1: this.banner1Preview() || '',
            banner2: this.banner2Preview() || '',
        };
        this.saveBanners.emit(newBanners);
        alert('Banners guardados');
        this.close.emit();
    }

    handleResetDB() {
        if (confirm("¿RESET DB?")) {
            this.productService.resetDatabase().subscribe({ next: (res) => { alert(res.message); window.location.reload(); }, error: (err) => alert('Error: ' + err.error?.error) });
        }
    }
    onClose(): void { this.close.emit(); }
}