import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Asegúrate de que esta ruta a CartItem sea correcta en tu proyecto
import { CartItem } from '../../models/cart-item.model';

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.css'], // Apunta al CSS puro
})
export class ShoppingCartComponent {
    @Input() isOpen = false;
    @Input() items: CartItem[] = [];

    @Output() close = new EventEmitter<void>();
    @Output() updateQuantity = new EventEmitter<{ id: string; quantity: number; size?: string }>();
    @Output() removeItem = new EventEmitter<{ id: string; size?: string }>();

    get subtotal(): number {
        return this.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    }

    get shipping(): number {
        return this.subtotal > 50 ? 0 : 5;
    }

    get total(): number {
        return this.subtotal + this.shipping;
    }

    onClose(): void {
        this.close.emit();
    }

    changeQuantity(item: CartItem, newQty: number): void {
        if (newQty < 1) return;
        this.updateQuantity.emit({ id: item.id, quantity: newQty, size: item.size });
    }

    remove(item: CartItem): void {
        this.removeItem.emit({ id: item.id, size: item.size });
    }
}