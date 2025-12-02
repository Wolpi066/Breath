import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model';
import { BannerData } from '../../models/banner.model';
import { MinimalProductCardComponent } from '../minimal-product-card/minimal-product-card.component';

export interface ProductSize { size: string; stock: number; }

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, MinimalProductCardComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnChanges {
    @Input() products: Product[] = [];
    @Input() banners: BannerData = { banner1: '', banner2: '' };
    @Output() close = new EventEmitter<void>();
    @Output() saveProduct = new EventEmitter<Product>();
    @Output() deleteProduct = new EventEmitter<string>();
    @Output() saveBanners = new EventEmitter<BannerData>();

    // ESTADO INTERNO
    activeTab: 'productos' | 'banners' = 'productos';
    filteredProducts: Product[] = [];
    searchTerm = '';
    categoryFilter = 'todos';
    isEditing = false;
    editingProduct: Product | null = null;

    // FORMULARIO (Signals)
    formData = signal<Partial<Product>>({ category: 'remeras', price: 0, discount: 0, sizes: [{ size: 'S', stock: 0 }] });

    // PREVIEWS (Signals)
    mainImagePreview = signal<string | null>(null);
    hoverImagePreview = signal<string | null>(null);
    banner1Preview = signal<string | null>(null);
    banner2Preview = signal<string | null>(null);

    categoriesOptions = ['remeras', 'buzos', 'pantalones', 'gorras', 'otro'];
    sizesOptions = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['products']) {
            this.applyFilters();
        }
        if (changes['banners']) {
            this.banner1Preview.set(this.banners?.banner1 || null);
            this.banner2Preview.set(this.banners?.banner2 || null);
        }
    }

    // --- UI helpers ---
    setTab(tab: 'productos' | 'banners'): void {
        this.activeTab = tab;
        this.cancelEdit();
    }

    getCategoryLabel(category: string | undefined): string {
        switch (category) {
            case 'remeras': return 'REMERAS'; case 'buzos': return 'BUZOS';
            case 'pantalones': return 'PANTALONES'; case 'gorras': return 'GORRAS';
            default: return 'OTRO';
        }
    }

    getSizesLabel(product: Product): string {
        if (!product || !product.sizes) return '';
        return product.sizes.map((s) => `${s.size}(${s.stock})`).join(', ');
    }

    // --- FILTROS ---
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

    onCategoryChange(category: string): void {
        this.categoryFilter = category;
        this.applyFilters();
    }

    // --- ABM (CRUD) ---
    newProduct(): void {
        this.isEditing = true;
        this.editingProduct = { id: '', name: '', description: '', category: 'remeras', price: 0, discount: 0, sizes: [{ size: 'S', stock: 0 }], mainImage: '', hoverImage: '' };
        this.mainImagePreview.set(null);
        this.hoverImagePreview.set(null);
    }

    // 🟢 ESTA ES LA FUNCIÓN QUE BUSCABA EL HTML
    handleEdit(product: Product): void {
        this.isEditing = true;
        this.editingProduct = JSON.parse(JSON.stringify(product));
        this.mainImagePreview.set(product.mainImage);
        this.hoverImagePreview.set(product.hoverImage ?? null);
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.editingProduct = null;
        this.mainImagePreview.set(null);
        this.hoverImagePreview.set(null);
    }

    // ... (Resto de funciones ABM y Banners) ...

    handleImageUpload(event: Event, type: 'mainImage' | 'hoverImage' | 'banner1' | 'banner2') {
        const input = event.target as HTMLInputElement;
        if (!input.files || input.files.length === 0) return;
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const base64String = reader.result as string;
            if (type === 'mainImage') { this.mainImagePreview.set(base64String); this.formData.update(data => ({ ...data, mainImage: base64String })); }
            else if (type === 'hoverImage') { this.hoverImagePreview.set(base64String); this.formData.update(data => ({ ...data, hoverImage: base64String })); }
            else if (type === 'banner1') { this.banner1Preview.set(base64String); }
            else if (type === 'banner2') { this.banner2Preview.set(base64String); }
        };
        reader.readAsDataURL(file);
    }

    handleAddSize() { this.formData.update(data => ({ ...data, sizes: [...(data.sizes || []), { size: 'M', stock: 0 } as ProductSize] })); }

    handleRemoveSize(index: number) { this.formData.update(data => ({ ...data, sizes: data.sizes?.filter((_, i) => i !== index) })); }

    handleUpdateSize(index: number, field: 'size' | 'stock', event: Event) {
        const value = (event.target as HTMLInputElement).value;
        const stockValue = field === 'stock' ? parseInt(value) || 0 : value;
        this.formData.update(data => {
            const newSizes = [...(data.sizes || [])];
            newSizes[index] = { ...newSizes[index], [field]: stockValue } as ProductSize;
            return { ...data, sizes: newSizes };
        });
    }

    handleSubmit(e: Event) {
        e.preventDefault();
        const data = this.formData();
        if (!data.name || data.price === undefined || !this.mainImagePreview()) { alert("Faltan campos requeridos."); return; }
        if (!data.sizes || data.sizes.length === 0) { alert("Debe agregar al menos un talle."); return; }

        const finalProduct: Product = {
            ...this.editingProduct,
            ...data,
            id: this.editingProduct?.id || Date.now().toString(),
            hoverImage: data.hoverImage || data.mainImage || '',
            description: data.description || '',
            mainImage: this.mainImagePreview() || ''
        } as Product;

        this.saveProduct.emit(finalProduct);
        this.cancelEdit();
    }

    handleDelete(id: string) {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
            this.deleteProduct.emit(id);
        }
    }

    handleSaveBanners() {
        const newBanners: BannerData = {
            banner1: this.banner1Preview() || '',
            banner2: this.banner2Preview() || '',
        };
        this.saveBanners.emit(newBanners);
        alert('Banners guardados correctamente.');
        this.close.emit();
    }

    onClose(): void {
        this.close.emit();
    }
}