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
    @ViewChild('heroVideo') videoElement!: ElementRef<HTMLVideoElement>;

    ngAfterViewInit() {
        if (this.videoElement && this.videoElement.nativeElement) {
            this.videoElement.nativeElement.muted = true;
            this.videoElement.nativeElement.play().catch(error => {
                console.log("El navegador bloqueó el autoplay:", error);
            });
        }
    }
}