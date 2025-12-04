import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartItem } from '../../models/cart-item.model';

@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.css'],
})
export class ShoppingCartComponent {
    @Input() isOpen = false;
    @Input() items: CartItem[] = [];

    @Output() close = new EventEmitter<void>();
    // ✅ Size ahora es obligatorio
    @Output() updateQuantity = new EventEmitter<{ id: string; quantity: number; size: string }>();
    @Output() removeItem = new EventEmitter<{ id: string; size: string }>();

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

        // ✅ Validación: No permitir subir más allá del stock
        if (newQty > item.stock) {
            // Opcional: alert('Stock máximo alcanzado');
            return;
        }

        this.updateQuantity.emit({ id: item.id, quantity: newQty, size: item.size });
    }

    remove(item: CartItem): void {
        this.removeItem.emit({ id: item.id, size: item.size });
    }

    initiateCheckout() {
        if (this.items.length === 0) return;
        // ... (Tu lógica de WhatsApp queda igual)
        const phoneNumber = "5491135172352";
        let message = "Hola BREATHE, quiero iniciar una compra:\n\n";
        this.items.forEach(item => {
            message += `• ${item.name} | Talle: ${item.size} | Cant: ${item.quantity} | $${item.price * item.quantity}\n`;
        });
        message += `\n*Total Final: $${this.total}*`;
        message += "\n\nEspero confirmación para coordinar el pago y envío.";
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
}