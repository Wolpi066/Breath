import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-minimal-footer',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './minimal-footer.component.html',
    styleUrls: ['./minimal-footer.component.css']
})
export class MinimalFooterComponent {
    // Ya no usamos el Input showAdminLink porque lo hicimos siempre visible
    @Output() adminClick = new EventEmitter<void>();

    onAdminClick() {
        this.adminClick.emit();
    }
} 