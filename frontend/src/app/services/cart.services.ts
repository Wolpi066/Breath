import { Injectable } from '@angular/core';
import { CartItem } from '../models/cart-item.model';

@Injectable({
    providedIn: 'root',
})
export class CartService {
    items: CartItem[] = [];
    isOpen = false;

    get cartItemsCount(): number {
        return this.items.reduce((acc, item) => acc + item.quantity, 0);
    }

    open(): void {
        this.isOpen = true;
    }

    close(): void {
        this.isOpen = false;
    }

    addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): void {
        const existing = this.items.find((i) => i.id === item.id);
        if (existing) {
            existing.quantity += item.quantity ?? 1;
        } else {
            this.items.push({
                ...item,
                quantity: item.quantity ?? 1,
            });
        }
    }

    updateQuantity(id: string, quantity: number): void {
        const item = this.items.find((i) => i.id === id);
        if (!item) return;

        if (quantity <= 0) {
            this.removeItem(id);
            return;
        }
        item.quantity = quantity;
    }

    removeItem(id: string): void {
        this.items = this.items.filter((i) => i.id !== id);
    }

    clear(): void {
        this.items = [];
    }
}
