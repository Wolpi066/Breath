import { Component, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MinimalNavbarComponent } from './components/minimal-navbar/minimal-navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { MinimalProductGridComponent } from './components/minimal-product-grid/minimal-product-grid.component';
import { ProductsPageComponent } from './components/products-page/products-page.components';
import { MinimalFooterComponent } from './components/minimal-footer/minimal-footer.component';
import { ShoppingCartComponent } from './components/shopping-cart/shopping-cart.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
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

// --- LISTA MAESTRA DE PRODUCTOS (11 ITEMS ÚNICOS) ---
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1', name: 'HOODIE BREATHE MASK', description: 'Buzo con capucha diseño máscara', category: 'buzos',
    price: 85, discount: 0,
    sizes: [{ size: 'S', stock: 7 }, { size: 'M', stock: 11 }, { size: 'L', stock: 9 }, { size: 'XL', stock: 5 }],
    mainImage: buzoBreathe, hoverImage: buzoBreathe
  },
  {
    id: '2', name: 'HOODIE BREATHE ASTRONAUT', description: 'Buzo con capucha astronauta', category: 'buzos',
    price: 90, discount: 0,
    sizes: [{ size: 'S', stock: 6 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 4 }],
    mainImage: buzoBreatheAstronaut, hoverImage: buzoBreatheAstronaut
  },
  {
    id: '3', name: 'HOODIE HOPELESS STATUE', description: 'Buzo clásica', category: 'buzos',
    price: 95, discount: 20,
    sizes: [{ size: 'S', stock: 6 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 5 }],
    mainImage: buzoHopeless, hoverImage: buzoHopeless
  },
  {
    id: '4', name: 'T-SHIRT PARADISE', description: 'Remera blanca tropical', category: 'remeras',
    price: 40, discount: 0,
    sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 15 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }],
    mainImage: remeraParadise, hoverImage: remeraParadise
  },
  {
    id: '5', name: 'HOODIE ROSWELL RECORD', description: 'Buzo Roswell', category: 'buzos',
    price: 90, discount: 15,
    sizes: [{ size: 'S', stock: 6 }, { size: 'M', stock: 10 }, { size: 'L', stock: 8 }, { size: 'XL', stock: 4 }],
    mainImage: buzoRoswell, hoverImage: buzoRoswell
  },
  {
    id: '6', name: 'HOODIE TRAGEDY', description: 'Buzo Tragedy', category: 'buzos',
    price: 85, discount: 0,
    sizes: [{ size: 'S', stock: 8 }, { size: 'M', stock: 12 }, { size: 'L', stock: 10 }, { size: 'XL', stock: 6 }],
    mainImage: buzoTragedy, hoverImage: buzoTragedy
  },
  {
    id: '7', name: 'T-SHIRT WHO SHOT CUPID WHITE', description: 'Remera blanca cupido', category: 'remeras',
    price: 42, discount: 10,
    sizes: [{ size: 'S', stock: 12 }, { size: 'M', stock: 18 }, { size: 'L', stock: 14 }, { size: 'XL', stock: 10 }],
    mainImage: remeraCupidWhite, hoverImage: remeraCupidWhite
  },
  {
    id: '8', name: 'T-SHIRT LAST HIT', description: 'Remera negra last hit', category: 'remeras',
    price: 45, discount: 0,
    sizes: [{ size: 'S', stock: 10 }, { size: 'M', stock: 16 }, { size: 'L', stock: 12 }, { size: 'XL', stock: 8 }],
    mainImage: remeraLastHit, hoverImage: remeraLastHit
  },
  {
    id: '9', name: 'T-SHIRT WHO SHOT CUPID BLACK', description: 'Remera negra cupido', category: 'remeras',
    price: 42, discount: 0,
    sizes: [{ size: 'S', stock: 14 }, { size: 'M', stock: 20 }, { size: 'L', stock: 16 }, { size: 'XL', stock: 12 }],
    mainImage: remeraCupidBlack, hoverImage: remeraCupidBlack
  },
  {
    id: '10', name: 'CAP BREATHE WHITE', description: 'Gorra blanca', category: 'gorras',
    price: 30, discount: 0,
    sizes: [{ size: 'Única', stock: 25 }],
    mainImage: gorraWhite, hoverImage: gorraWhite
  },
  {
    id: '11', name: 'CAP BREATHE BLACK', description: 'Gorra negra', category: 'gorras',
    price: 30, discount: 0,
    sizes: [{ size: 'Única', stock: 30 }],
    mainImage: gorraBlack, hoverImage: gorraBlack
  },
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
    AdminDashboardComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  // --- ESTADO ---
  currentPage = signal<'home' | 'productos' | 'contacto' | 'about'>('home');
  cart = signal<{ id: string; name: string; price: number; quantity: number; image: string; size?: string }[]>([]);
  isCartOpen = signal(false);
  isAdminOpen = signal(false);
  adminProducts = signal<Product[]>([]);
  banners = signal<BannerData>({ banner1: banner1Img, banner2: banner2Img });

  cartItemsCount = computed(() => this.cart().reduce((acc, item) => acc + item.quantity, 0));

  // --- INICIALIZACIÓN ---
  constructor() {
    // Carga de productos (usando la lista INITIAL_PRODUCTS completa)
    if (INITIAL_PRODUCTS.length > 0) {
      this.adminProducts.set(INITIAL_PRODUCTS);
      localStorage.setItem('breath-products', JSON.stringify(INITIAL_PRODUCTS));
    } else {
      const saved = localStorage.getItem('breath-products');
      if (saved) this.adminProducts.set(JSON.parse(saved));
      else this.adminProducts.set([]);
    }

    // Carga de Banners
    const savedBanners = localStorage.getItem('breath-banners');
    if (savedBanners) this.banners.set(JSON.parse(savedBanners));
  }

  // --- HOTKEYS ---
  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      this.isAdminOpen.set(true);
    }
  }

  // --- NAVEGACIÓN ---
  navigate(page: 'home' | 'productos' | 'contacto' | 'about') { // 👈 TIPOS EXPANDIDOS
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openCart() { this.isCartOpen.set(true); }
  closeCart() { this.isCartOpen.set(false); }

  // --- LÓGICA CARRITO ---
  addToCart(productId: string) {
    const product = this.adminProducts().find((p) => p.id === productId);
    if (!product) return;

    const existing = this.cart().find((i) => i.id === productId);
    if (existing) {
      this.cart.update((prev) => prev.map((i) => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      this.cart.update((prev) => [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.mainImage,
        size: 'Única'
      }]);
    }
    // "Silencioso": No abrimos el carrito
    console.log('Producto agregado');
  }

  updateQuantity(event: { id: string; quantity: number }) {
    this.cart.update((prev) => prev.map((i) => i.id === event.id ? { ...i, quantity: event.quantity } : i));
  }

  removeItem(event: { id: string; size?: string }) {
    const id = event.id;
    this.cart.update((prev) => prev.filter((i) => i.id !== id));
  }

  // --- LÓGICA ADMIN ---
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