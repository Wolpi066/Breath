import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Agregué CurrencyPipe por si acaso
import { FormsModule } from '@angular/forms';
import { Product, ProductSize } from '../../models/product.model';
import { BannerData } from '../../models/banner.model';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, CurrencyPipe],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
    @Input() products: Product[] = [];
    @Input() banners: BannerData | null = null;

    @Output() close = new EventEmitter<void>();
    @Output() saveProduct = new EventEmitter<Product>();
    @Output() deleteProduct = new EventEmitter<string>();
    @Output() saveBanners = new EventEmitter<BannerData>();

    // 👇 CORRECCIÓN AQUÍ: Cambié 'products' a 'productos' para que coincida
    activeTab = signal<'productos' | 'banners'>('productos');

    // -- PRODUCTOS --
    editingProduct = signal<Product | null>(null);
    formData: Partial<Product> = {};

    // -- BANNERS --
    banner1Preview = signal<string>('');
    banner2Preview = signal<string>('');

    // Helpers
    categories = ['buzos', 'remeras', 'pantalones', 'gorras', 'otro'];
    defaultSizes = ['S', 'M', 'L', 'XL', 'XXL', 'Única'];

    ngOnInit() {
        if (this.banners) {
            this.banner1Preview.set(this.banners.banner1 || '');
            this.banner2Preview.set(this.banners.banner2 || '');
        }
    }

    // --- NAVEGACIÓN ---
    // 👇 CORRECCIÓN AQUÍ TAMBIÉN: El tipo del parámetro
    setTab(tab: 'productos' | 'banners') {
        this.activeTab.set(tab);
        if (tab === 'banners') this.cancelEdit();
    }

    onClose() {
        this.close.emit();
    }

    // --- LÓGICA PRODUCTOS ---
    startNewProduct() {
        this.editingProduct.set({
            id: '', name: '', description: '', category: 'remeras',
            price: 0, discount: 0, sizes: [], mainImage: '', hoverImage: ''
        } as Product);
        this.formData = { ...this.editingProduct()! };
    }

    startEdit(product: Product) {
        this.editingProduct.set(product);
        this.formData = JSON.parse(JSON.stringify(product));
    }

    cancelEdit() {
        this.editingProduct.set(null);
        this.formData = {};
    }

    addSize() {
        const currentSizes = this.formData.sizes || [];
        this.formData.sizes = [...currentSizes, { size: 'M', stock: 0 }];
    }

    removeSize(index: number) {
        if (this.formData.sizes) {
            this.formData.sizes.splice(index, 1);
        }
    }

    onSubmitProduct() {
        if (!this.formData.name || !this.formData.price) {
            alert('Nombre y precio son obligatorios');
            return;
        }

        const productToSave: Product = {
            ...this.formData as Product,
            id: this.formData.id || Date.now().toString()
        };

        this.saveProduct.emit(productToSave);
        this.cancelEdit();
        alert('Producto guardado correctamente');
    }

    onDeleteProduct(id: string) {
        if (confirm('¿Eliminar producto?')) {
            this.deleteProduct.emit(id);
            this.cancelEdit();
        }
    }

    // --- LÓGICA IMÁGENES ---
    handleImageUpload(event: Event, type: 'main' | 'hover' | 'banner1' | 'banner2') {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;

            if (type === 'main') this.formData.mainImage = result;
            if (type === 'hover') this.formData.hoverImage = result;
            if (type === 'banner1') this.banner1Preview.set(result);
            if (type === 'banner2') this.banner2Preview.set(result);
        };

        reader.readAsDataURL(file);
    }

    // --- LÓGICA BANNERS ---
    onSaveBanners() {
        this.saveBanners.emit({
            banner1: this.banner1Preview(),
            banner2: this.banner2Preview()
        });
        alert('Banners guardados correctamente');
    }
}