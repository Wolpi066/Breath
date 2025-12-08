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
  
  // 1. Quitamos el email del modelo de datos
  formData = {
    name: '',
    subject: '',
    message: ''
  };

  isSubmitting = signal(false);

  // Tu número de WhatsApp (formato internacional sin + ni 0)
  // Basado en tu HTML anterior: +54 11 3517-2352 -> 5491135172352 (A veces en Arg se agrega el 9)
  // Usaré el que tenías: 541135172352
  private phoneNumber = '541135172352'; 

  onSubmit() {
    // Validación simple
    if (!this.formData.name || !this.formData.message) {
      alert('Por favor completa tu nombre y el mensaje.');
      return;
    }

    this.isSubmitting.set(true);

    // 2. Construimos el Copywriting personalizado
    // "Hola Breathe! soy [Nombre] queria consultar sobre [Asunto] , [Mensaje]. Saludos!"
    const text = `Hola Breathe! soy ${this.formData.name}, quería consultar sobre ${this.formData.subject || 'un tema'}: ${this.formData.message}. Saludos!`;

    // 3. Codificamos el texto para URL (cambia espacios por %20, etc.)
    const encodedText = encodeURIComponent(text);

    // 4. Generamos la URL de la API de WhatsApp
    const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedText}`;

    // 5. Abrimos WhatsApp en una nueva pestaña
    window.open(whatsappUrl, '_blank');

    this.isSubmitting.set(false);
    
    // Opcional: limpiar el formulario o dejarlo como está
    // this.formData = { name: '', subject: '', message: '' };
  }
}