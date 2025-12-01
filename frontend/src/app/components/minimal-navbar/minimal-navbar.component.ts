import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-minimal-navbar',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './minimal-navbar.component.html',
    styleUrls: ['./minimal-navbar.component.css']
})
export class MinimalNavbarComponent {
    @Input() cartItemsCount = 0;
    @Output() cartClick = new EventEmitter<void>();
    @Output() navigate = new EventEmitter<'home' | 'productos' | 'contacto' | 'about'>();

    isMenuOpen = false;
    isSearchOpen = false;
    searchQuery = '';

    isPastHero = false;
    isHovered = false;

    get isDarkContent(): boolean {
        return this.isPastHero || this.isHovered || this.isMenuOpen || this.isSearchOpen;
    }

    get isSolidBg(): boolean {
        return this.isHovered || this.isMenuOpen || this.isSearchOpen;
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isPastHero = window.scrollY > (window.innerHeight - 50);
    }

    // 👇 ESTAS SON LAS FUNCIONES QUE FALTABAN Y DABA ERROR
    onMouseEnter() { this.isHovered = true; }
    onMouseLeave() { this.isHovered = false; }

    toggleMenu() { this.isMenuOpen = !this.isMenuOpen; if (this.isMenuOpen) this.isSearchOpen = false; }
    toggleSearch() { this.isSearchOpen = !this.isSearchOpen; if (this.isSearchOpen) this.isMenuOpen = false; }
    openCart() { this.cartClick.emit(); }

    navigateTo(path: 'home' | 'productos' | 'contacto' | 'about') {
        this.navigate.emit(path);
        this.isMenuOpen = false;
        this.isSearchOpen = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}