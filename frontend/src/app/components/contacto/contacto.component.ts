import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.css']
})
export class ContactoComponent {

  formData = {
    name: '',
    subject: '',
    message: ''
  };

  isSubmitting = signal(false);

  private phoneNumber = '541135172352';

  onSubmit() {

    if (!this.formData.name || !this.formData.message) {
      alert('Por favor completa tu nombre y el mensaje.');
      return;
    }

    this.isSubmitting.set(true);

    const text = `Hola Breathe! soy ${this.formData.name}, quería consultar sobre ${this.formData.subject || 'un tema'}: ${this.formData.message}. Saludos!`;

    const encodedText = encodeURIComponent(text);

    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');

    this.isSubmitting.set(false);

    // Opcional: limpiar el formulario o dejarlo como está
    // this.formData = { name: '', subject: '', message: '' };
  }
}