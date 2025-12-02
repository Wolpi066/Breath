import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MinimalNavbarComponent } from './components/minimal-navbar/minimal-navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { MinimalProductGridComponent } from './components/minimal-product-grid/minimal-product-grid.component';
import { ProductsPageComponent } from './components/products-page/products-page.components';
import { MinimalFooterComponent } from './components/minimal-footer/minimal-footer.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AuthModalComponent } from './components/auth-modal/auth-modal.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { Product } from './models/product.model';
import { BannerData } from './models/banner.model';

// --- RUTAS DE IMÁGENES ---
const buzoBreathe = 'assets/CARDS/NEWstfu.png';
const buzoBreatheAstronaut = 'assets/CARDS/NEWapollo.png';
const buzoHopeless = 'assets/CARDS/NEWhopeless.png';
const remeraParadise = 'assets/CARDS/NEWparadise.png';
const buzoRoswell = 'assets/CARDS/NEWroswell.png';
const buzoTragedy = 'assets/CARDS/NEWtragedy.png';
const remeraCupidWhite = 'assets/CARDS/NEWcupidBlanca.png';
const remeraLastHit = 'assets/CARDS/NEWlasthit.png';
const remeraCupidBlack = 'assets/CARDS/NEWcupidNegra.png';
const gorraWhite = 'assets/CARDS/NEWgorraBlanca.png';
const gorraBlack = 'assets/CARDS/NEWgorraNegra.png';
const banner1Img = 'assets/CARDS/calleNoche.jpg';
const banner2Img = 'assets/CARDS/wmremove-transformed.png';

// --- LISTA MAESTRA (Simula el JSON que devolverá tu PHP con JOIN) ---
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'HOODIE BREATHE MASK', description: 'Buzo con capucha diseño máscara y "breathe"', category: 'buzos', price: 85, discount: 0, sizes: [{ size: 'S', stock: 7 }, { size: 'M', stock: 11 }, { size: 'L', stock: 9 }, { size: 'XL', stock: 5 }], mainImage: buzoBreathe, hoverImage: buzoBreathe },
  { id: '2', name: 'HOODIE BREATHE ASTRONAUT', description: 'Buzo con capucha diseño "breathe" y astronauta rojo', category: 'buzos', price: 90, discount: 0, sizes: [{ size: 'S', stock: 6 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 4 }], mainImage: buzoBreatheAstronaut, hoverImage: buzoBreatheAstronaut },
  { id: '3', name: 'HOODIE HOPELESS STATUE', description: 'Buzo con capucha diseño "HOPELESS" y escultura clásica', category: 'buzos', price: 95, discount: 20, sizes: [{ size: 'S', stock: 6 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 5 }], mainImage: buzoHopeless, hoverImage: buzoHopeless },
  { id: '4', name: 'T-SHIRT PARADISE', description: 'Remera blanca "Another day in Paradise" con paisaje tropical', category: 'remeras', price: 40, discount: 0, sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 15 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }], mainImage: remeraParadise, hoverImage: remeraParadise },
  { id: '5', name: 'HOODIE ROSWELL RECORD', description: 'Buzo con capucha diseño "Roswell Daily Record"', category: 'buzos', price: 90, discount: 15, sizes: [{ size: 'S', stock: 6 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 4 }], mainImage: buzoRoswell, hoverImage: buzoRoswell },
  { id: '6', name: 'HOODIE TRAGEDY', description: 'Buzo con capucha "Thank you for the tragedy"', category: 'buzos', price: 85, discount: 0, sizes: [{ size: 'S', stock: 8 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 6 }], mainImage: buzoTragedy, hoverImage: buzoTragedy },
  { id: '7', name: 'T-SHIRT WHO SHOT CUPID WHITE', description: 'Remera blanca "who shot cupid?" con cupido atravesado', category: 'remeras', price: 42, discount: 10, sizes: [{ size: 'S', stock: 12 }, { size: 'M', stock: 18 }, { size: 'L', stock: 14 }, { size: 'XL', stock: 10 }], mainImage: remeraCupidWhite, hoverImage: remeraCupidWhite },
  { id: '8', name: 'T-SHIRT LAST HIT', description: 'Remera negra "last hit" con pintura renacentista de cupido', category: 'remeras', price: 45, discount: 0, sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 16 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }], mainImage: remeraLastHit, hoverImage: remeraLastHit },
  { id: '9', name: 'T-SHIRT WHO SHOT CUPID BLACK', description: 'Remera negra "who shot cupid?" con cupido atravesado', category: 'remeras', price: 42, discount: 0, sizes: [{ size: 'S', stock: 14 }, { size: 'M', stock: 20 }, { size: 'L', stock: 16 }, { size: 'XL', stock: 12 }], mainImage: remeraCupidBlack, hoverImage: remeraCupidBlack },
  { id: '10', name: 'CAP BREATHE WHITE', description: 'Gorra blanca con bordado "breathe"', category: 'gorras', price: 30, discount: 0, sizes: [{ size: 'Única', stock: 25 }], mainImage: gorraWhite, hoverImage: gorraWhite },
  { id: '11', name: 'CAP BREATHE BLACK', description: 'Gorra negra con bordado "breathe"', category: 'gorras', price: 30, discount: 0, sizes: [{ size: 'Única', stock: 30 }], mainImage: gorraBlack, hoverImage: gorraBlack },
];

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
    ProductDetailComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  // --- ESTADO ---
  currentPage = signal<'home' | 'productos' | 'contacto' | 'about' | 'admin'>('home');
  cart = signal<{ id: string; name: string; price: number; quantity: number; image: string; size?: string }[]>([]);
  isCartOpen = signal(false);
  isAdminOpen = signal(false);
  adminProducts = signal<Product[]>([]);
  banners = signal<BannerData>({ banner1: banner1Img, banner2: banner2Img });

  currentUser = signal<string | null>(null);
  isAuthOpen = signal(false);
  selectedProduct = signal<Product | null>(null);

  cartItemsCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));

  constructor() {
    if (INITIAL_PRODUCTS.length > 0) {
      this.adminProducts.set(INITIAL_PRODUCTS);
      localStorage.setItem('breath-products', JSON.stringify(INITIAL_PRODUCTS));
    } else {
      const saved = localStorage.getItem('breath-products');
      if (saved) this.adminProducts.set(JSON.parse(saved));
      else this.adminProducts.set([]);
    }

    const savedBanners = localStorage.getItem('breath-banners');
    if (savedBanners) this.banners.set(JSON.parse(savedBanners));

    const savedUser = localStorage.getItem('breath-current-user');
    if (savedUser) this.currentUser.set(savedUser);
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

  openCart() { this.isCartOpen.set(true); }
  closeCart() { this.isCartOpen.set(false); }

  // --- AUTH ---
  openAuth() { this.isAuthOpen.set(true); }
  closeAuth() { this.isAuthOpen.set(false); }

  handleLogin(data: { user: string, pass: string }) {
    this.currentUser.set(data.user);
    localStorage.setItem('breath-current-user', data.user);
    this.closeAuth();
  }

  handleRegister(data: any) {
    this.currentUser.set(data.user);
    localStorage.setItem('breath-current-user', data.user);
    this.closeAuth();
  }

  handleLogout() {
    this.currentUser.set(null);
    localStorage.removeItem('breath-current-user');
    this.closeAuth();
  }

  // --- DETALLE PRODUCTO ---
  openProductDetail(productId: string) {
    const p = this.adminProducts().find(x => x.id === productId);
    if (p) this.selectedProduct.set(p);
  }

  // --- CARRITO ---
  addToCart(productId: string) {
    const product = this.adminProducts().find((p) => p.id === productId);
    if (!product) return;

    const defaultSize = 'Única';
    const cartItemId = `${product.id}-${defaultSize}`;

    const existing = this.cart().find((i) => i.id === cartItemId);
    if (existing) {
      this.cart.update((prev) => prev.map((i) => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      this.cart.update((prev) => [...prev, {
        id: cartItemId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.mainImage,
        size: defaultSize
      }]);
    }
    console.log('Producto agregado (Silencioso)');
  }

  addToCartWithSize(data: { id: string, size: string }) {
    const product = this.adminProducts().find((p) => p.id === data.id);
    if (!product) return;

    const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price;
    const cartItemId = `${product.id}-${data.size}`;

    const existing = this.cart().find((i) => i.id === cartItemId);
    if (existing) {
      this.cart.update((prev) => prev.map((i) => i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      this.cart.update((prev) => [...prev, {
        id: cartItemId,
        name: product.name,
        price: finalPrice,
        quantity: 1,
        image: product.mainImage,
        size: data.size
      }]);
    }

    this.selectedProduct.set(null);
    this.openCart();
  }

  updateQuantity(event: { id: string; quantity: number }) {
    this.cart.update((prev) => prev.map((i) => i.id === event.id ? { ...i, quantity: event.quantity } : i));
  }

  removeItem(event: { id: string; size?: string }) {
    const id = event.id;
    this.cart.update((prev) => prev.filter((i) => i.id !== id));
  }

  // --- ADMIN CRUD ---
  saveProduct(product: Product) {
    const exists = this.adminProducts().some((p) => p.id === product.id);
    let newList = exists ? this.adminProducts().map((p) => p.id === product.id ? product : p) : [...this.adminProducts(), product];
    this.adminProducts.set(newList);
    localStorage.setItem('breath-products', JSON.stringify(newList));
  }

  deleteProduct(id: string) {
    const newList = this.adminProducts().filter((p) => p.id !== id);
    this.adminProducts.set(newList);
    localStorage.setItem('breath-products', JSON.stringify(newList));
  }

  saveBanners(newBanners: BannerData) {
    this.banners.set(newBanners);
    localStorage.setItem('breath-banners', JSON.stringify(newBanners));
  }
}