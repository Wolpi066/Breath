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

    open(): void { this.isOpen = true; }
    close(): void { this.isOpen = false; }

    private findItem(id: string, size: string) {
        return this.items.find(i => i.id === id && i.size === size);
    }

    getQuantityInCart(id: string, size: string): number {
        const item = this.findItem(id, size);
        return item ? item.quantity : 0;
    }

    addItem(item: Omit<CartItem, 'quantity'> & { quantity?: number }): boolean {
        const quantityToAdd = item.quantity ?? 1;
        const existingItem = this.findItem(item.id, item.size);

        const currentQty = existingItem ? existingItem.quantity : 0;

        if (currentQty + quantityToAdd > item.stock) {
            alert(`No hay suficiente stock. Stock máx: ${item.stock}, En carrito: ${currentQty}`);
            return false;
        }

        if (existingItem) {
            existingItem.quantity += quantityToAdd;
        } else {
            this.items.push({
                ...item,
                quantity: quantityToAdd,
            });
        }
        return true;
    }

    updateQuantity(id: string, size: string, quantity: number): void {
        const item = this.findItem(id, size);
        if (!item) return;

        if (quantity <= 0) {
            this.removeItem(id, size);
            return;
        }

        if (quantity > item.stock) {
            alert(`Lo sentimos, solo hay ${item.stock} unidades disponibles en este talle.`);
            item.quantity = item.stock;
        } else {
            item.quantity = quantity;
        }
    }

    removeItem(id: string, size: string): void {
        this.items = this.items.filter(i => !(i.id === id && i.size === size));
    }

    clear(): void {
        this.items = [];
    }
}