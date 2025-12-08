import { Component, HostListener, signal, computed, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MinimalNavbarComponent } from './components/minimal-navbar/minimal-navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { MinimalProductGridComponent } from './components/minimal-product-grid/minimal-product-grid.component';
import { ProductsPageComponent } from './components/products-page/products-page.component';
import { MinimalFooterComponent } from './components/minimal-footer/minimal-footer.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';

// 👇 IMPORTAMOS LOS COMPONENTES CON LOS NOMBRES CORRECTOS
import { SobreNosotrosComponent } from './components/sobre-nosotros/sobre-nosotros.component';
import { ContactoComponent } from './components/contacto/contacto.component';

import { Product } from './models/product.model';
import { BannerData } from './models/banner.model';
import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';
import { CartService } from './services/cart.service';

const banner1Img = 'assets/CARDS/calleNoche.jpg';
const banner2Img = 'assets/CARDS/wmremove-transformed.png';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MinimalNavbarComponent,
    HeroComponent,
    MinimalProductGridComponent,
    ProductsPageComponent,
    MinimalFooterComponent,
    ShoppingCartComponent,
    AdminDashboardComponent,
    AuthModalComponent,
    ProductDetailComponent,
    // 👇 AGREGADOS AL ARRAY DE IMPORTS
    SobreNosotrosComponent,
    ContactoComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  private authService = inject(AuthService);
  private productService = inject(ProductService);
  public cartService = inject(CartService);

  @ViewChild(AuthModalComponent) authModal!: AuthModalComponent;

  // ESTADO
  currentPage = signal<'home' | 'productos' | 'contacto' | 'about' | 'admin'>('home');

  cart = signal(this.cartService.items);

  cartItemsCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));

  // UI
  isCartOpen = signal(false);
  isAuthOpen = signal(false);
  selectedProduct = signal<Product | null>(null);
  globalSearchTerm = signal('');

  // Datos
  adminProducts = signal<Product[]>([]);
  banners = signal<BannerData>({ banner1: banner1Img, banner2: banner2Img });

  currentUser = this.authService.currentUser;

  get isAdmin(): boolean {
    return this.currentUser() === 'admin';
  }

  ngOnInit() {
    this.loadDataFromBackend();
  }

  loadDataFromBackend() {
    this.productService.getProducts().subscribe({
      next: (data) => this.adminProducts.set(data),
      error: (err) => console.error('Error API:', err)
    });
    const savedBanners = this.productService.getBanners();
    if (savedBanners) this.banners.set(savedBanners);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      this.navigate('admin');
    }
  }

  handleSearch(term: string) {
    this.globalSearchTerm.set(term);
    if (term) {
      this.navigate('productos');
    }
  }

  navigate(page: 'home' | 'productos' | 'contacto' | 'about' | 'admin') {
    this.currentPage.set(page);
    this.selectedProduct.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // UI HELPERS
  openCart() { this.isCartOpen.set(true); }
  closeCart() { this.isCartOpen.set(false); }
  openAuth() { this.isAuthOpen.set(true); }
  closeAuth() { this.isAuthOpen.set(false); }

  handleAuthRedirect() {
    this.selectedProduct.set(null);
    this.navigate('home');
    this.openAuth();
  }

  openProductDetail(productId: string) {
    const p = this.adminProducts().find(x => x.id === productId);
    if (p) this.selectedProduct.set(p);
  }

  // AUTH
  handleLogin(data: { user: string, pass: string }) {
    this.authService.login(data.user, data.pass).subscribe({
      next: () => this.closeAuth(),
      error: (err) => alert(err.error?.error || 'Error login')
    });
  }

  handleRegister(data: any) {
    this.authService.register(data.user, data.email, data.pass).subscribe({
      next: () => {
        if (this.authModal) {
          this.authModal.showRegisterSuccess();
        }
      },
      error: (err) => alert(err.error?.error || 'Error registro')
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

    const sizeName = 'Única';
    const sizeInfo = product.sizes.find(s => s.size === sizeName) || product.sizes[0];

    if (!sizeInfo || sizeInfo.stock <= 0) {
      alert("Sin stock disponible");
      return;
    }

    this.processAddToCart(product, sizeInfo.size, 1, sizeInfo.stock);
  }

  addToCartWithSize(data: { id: string, size: string, quantity: number, stock?: number }) {
    const product = this.adminProducts().find((p) => p.id === data.id);
    if (!product) return;

    let stock = data.stock;
    if (stock === undefined) {
      stock = product.sizes.find(s => s.size === data.size)?.stock || 0;
    }

    this.processAddToCart(product, data.size, data.quantity, stock);
  }

  private processAddToCart(product: Product, size: string, quantity: number, stock: number) {
    const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    const cartItemId = `${product.id}-${size}`;

    const success = this.cartService.addItem({
      id: cartItemId,
      name: product.name,
      price: finalPrice,
      image: product.mainImage,
      size: size,
      quantity: quantity,
      stock: stock
    });

    if (success) {
      this.cart.set([...this.cartService.items]);

      this.selectedProduct.set(null);
      this.openCart();
    }
  }

  updateQuantity(event: { id: string; quantity: number; size?: string }) {

    const item = this.cartService.items.find(i => i.id === event.id);
    if (item) {
      this.cartService.updateQuantity(event.id, item.size, event.quantity);
      this.cart.set([...this.cartService.items]);
    }
  }

  removeItem(event: { id: string; size?: string }) {
    const item = this.cartService.items.find(i => i.id === event.id);
    if (item) {
      this.cartService.removeItem(event.id, item.size);
      this.cart.set([...this.cartService.items]);
    }
  }

  // ADMIN
  saveProduct(product: Product) {
    if (product.id && this.adminProducts().some(p => p.id === product.id)) {
      this.productService.updateProduct(product).subscribe(() => {
        this.loadDataFromBackend();
        alert('Producto actualizado');
      });
    } else {
      this.productService.createProduct(product).subscribe(() => {
        this.loadDataFromBackend();
        alert('Producto creado');
      });
    }
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.loadDataFromBackend();
      alert('Producto eliminado');
    });
  }

  saveBanners(newBanners: BannerData) {
    this.productService.saveBanners(newBanners);
    this.banners.set(newBanners);
  }
}