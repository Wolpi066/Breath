import { Component, HostListener, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes
import { MinimalNavbarComponent } from './components/minimal-navbar/minimal-navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { MinimalProductGridComponent } from './components/minimal-product-grid/minimal-product-grid.component';
import { ProductsPageComponent } from './components/products-page/products-page.components';
import { MinimalFooterComponent } from './components/minimal-footer/minimal-footer.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

// Modelos y Servicios
import { Product } from './models/product.model';
import { BannerData } from './models/banner.model';
import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';

// Rutas de imágenes fallback (por si la DB falla)
const banner1Img = 'assets/CARDS/calleNoche.jpg';
const banner2Img = 'assets/CARDS/wmremove-transformed.png';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, MinimalNavbarComponent, HeroComponent, MinimalProductGridComponent,
    ProductsPageComponent, MinimalFooterComponent, ShoppingCartComponent,
    AdminDashboardComponent, AuthModalComponent, ProductDetailComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  // Inyección de Servicios
  private authService = inject(AuthService);
  private productService = inject(ProductService);

  // --- ESTADO ---
  currentPage = signal<'home' | 'productos' | 'contacto' | 'about' | 'admin'>('home');

  cart = signal<{ id: string; name: string; price: number; quantity: number; image: string; size?: string }[]>([]);
  cartItemsCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));

  // UI States
  isCartOpen = signal(false);
  isAuthOpen = signal(false);
  selectedProduct = signal<Product | null>(null);

  // Data Real (Viene del Backend)
  adminProducts = signal<Product[]>([]);
  banners = signal<BannerData>({ banner1: banner1Img, banner2: banner2Img });

  // Auth State (Conectado al servicio)
  currentUser = this.authService.currentUser; // Signal enlazada al servicio

  ngOnInit() {
    this.loadDataFromBackend();
  }

  // --- CARGA DE DATOS REALES ---
  loadDataFromBackend() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('📦 Productos cargados desde MySQL:', data);
        this.adminProducts.set(data);
      },
      error: (err) => {
        console.error('❌ Error conectando al Backend:', err);
        alert('Error de conexión con el servidor. Revisa que XAMPP esté corriendo.');
      }
    });

    // Banners
    this.banners.set(this.productService.getBanners());
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      this.navigate('admin');
    }
  }

  // --- NAVEGACIÓN ---
  navigate(page: 'home' | 'productos' | 'contacto' | 'about' | 'admin') {
    this.currentPage.set(page);
    this.selectedProduct.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- UI ---
  openCart() { this.isCartOpen.set(true); }
  closeCart() { this.isCartOpen.set(false); }
  openAuth() { this.isAuthOpen.set(true); }
  closeAuth() { this.isAuthOpen.set(false); }

  openProductDetail(productId: string) {
    const p = this.adminProducts().find(x => x.id === productId);
    if (p) this.selectedProduct.set(p);
  }

  // --- AUTH ACTIONS (Reales) ---
  handleLogin(data: { user: string, pass: string }) {
    this.authService.login(data.user, data.pass).subscribe({
      next: () => {
        this.closeAuth();
        // alert('Bienvenido ' + data.user);
      },
      error: (err) => alert('Login fallido: ' + (err.error?.error || 'Credenciales incorrectas'))
    });
  }

  handleRegister(data: any) {
    this.authService.register(data.user, data.email, data.pass).subscribe({
      next: () => {
        this.closeAuth();
        alert('Registro exitoso. Inicia sesión.');
        this.openAuth();
      },
      error: (err) => alert('Error registro: ' + (err.error?.error || 'Intenta de nuevo'))
    });
  }

  handleLogout() {
    this.authService.logout();
    this.closeAuth();
    this.navigate('home');
  }

  // --- CARRITO ---
  addToCart(productId: string) {
    const product = this.adminProducts().find((p) => p.id === productId);
    if (!product) return;
    this.addItemToCart(product, 'Única');
  }

  addToCartWithSize(data: { id: string, size: string }) {
    const product = this.adminProducts().find((p) => p.id === data.id);
    if (!product) return;
    this.addItemToCart(product, data.size);
    this.selectedProduct.set(null);
    this.openCart();
  }

  private addItemToCart(product: Product, size: string) {
    const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    const cartItemId = `${product.id}-${size}`;

    const existing = this.cart().find((i) => i.id === cartItemId);
    if (existing) {
      this.cart.update(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      this.cart.update(prev => [...prev, {
        id: cartItemId, name: product.name, price: finalPrice,
        quantity: 1, image: product.mainImage, size: size
      }]);
    }
  }

  updateQuantity(event: { id: string; quantity: number }) {
    this.cart.update((prev) => prev.map((i) => i.id === event.id ? { ...i, quantity: event.quantity } : i));
  }

  removeItem(event: { id: string; size?: string }) {
    const id = event.id;
    this.cart.update((prev) => prev.filter((i) => i.id !== id));
  }

  // --- ADMIN CRUD (Conectado al Backend) ---
  saveProduct(product: Product) {
    // Si tiene ID y existe en la lista, es Edición
    if (product.id && this.adminProducts().some(p => p.id === product.id)) {
      this.productService.updateProduct(product).subscribe({
        next: () => {
          this.loadDataFromBackend(); // Recarga real
          alert('Producto actualizado');
        },
        error: (err) => alert('Error al actualizar: ' + err.message)
      });
    } else {
      // Crear Nuevo
      this.productService.createProduct(product).subscribe({
        next: () => {
          this.loadDataFromBackend(); // Recarga real
          alert('Producto creado');
        },
        error: (err) => alert('Error al crear: ' + err.message)
      });
    }
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.loadDataFromBackend(); // Recarga real
        alert('Producto eliminado');
      },
      error: (err) => alert('Error al eliminar: ' + err.message)
    });
  }

  saveBanners(newBanners: BannerData) {
    this.productService.saveBanners(newBanners);
    this.banners.set(newBanners);
  }
}