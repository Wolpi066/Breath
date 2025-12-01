import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero.component.html',
    styleUrl: './hero.component.css'
})
export class HeroComponent implements AfterViewInit {
    // Referencia al elemento de video en el HTML
    @ViewChild('heroVideo') videoElement!: ElementRef<HTMLVideoElement>;

    ngAfterViewInit() {
        // Intentamos reproducir apenas carga el componente
        if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.muted = true; // Re-confirmamos que esté muteado (vital para autoplay)
            this.videoElement.nativeElement.play().catch(error => {
                console.log("El navegador bloqueó el autoplay:", error);
            });
        }
    }
}