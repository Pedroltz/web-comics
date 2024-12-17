import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Capitulo } from '../../models/manga.interface';

@Component({
  selector: 'app-manga-viewer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './manga-viewer.component.html',
  styleUrls: ['./manga-viewer.component.css']
})
export class MangaViewerComponent implements OnInit {
  @Input() capitulo!: Capitulo;
  @Input() mangaId!: string;
  @Output() onClose = new EventEmitter<void>();

  currentPage: number = 0;
  scale: number = 1;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  translateX: number = 0;
  translateY: number = 0;
  lastTouchDistance: number = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    console.log('MangaViewer - Inicializando com:', {
      capitulo: this.capitulo,
      mangaId: this.mangaId
    });
    
    if (!this.mangaId) {
      console.error('MangaId não foi fornecido!');
    }
    
    if (!this.capitulo.paginas) {
      console.warn('Capítulo sem páginas!');
    } else {
      console.log('Número de páginas:', this.capitulo.paginas.length);
    }
  }

  voltarParaDetalhe() {
    console.log('Voltando para o mangá:', this.mangaId);
    if (this.mangaId) {
      this.router.navigate(['/manga', this.mangaId]).then(() => {
        console.log('Navegação concluída');
        this.onClose.emit();
      }).catch(err => {
        console.error('Erro na navegação:', err);
      });
    } else {
      console.error('MangaId não definido');
    }
  }

  nextPage() {
    if (this.capitulo.paginas && this.currentPage < this.capitulo.paginas.length - 1) {
      this.currentPage++;
      this.resetZoom();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.resetZoom();
    }
  }

  goToPage(index: number) {
    if (this.capitulo.paginas && index >= 0 && index < this.capitulo.paginas.length) {
      this.currentPage = index;
      this.resetZoom();
    }
  }

  zoomIn() {
    if (this.scale < 3) {
      this.scale += 0.1;
    }
  }

  zoomOut() {
    if (this.scale > 0.5) {
      this.scale -= 0.1;
    }
  }

  resetZoom() {
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
  }

  onMouseDown(event: MouseEvent) {
    if (this.scale > 1) {
      this.isDragging = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
      event.preventDefault();
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
      this.constrainPan();
      event.preventDefault();
    }
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onMouseLeave() {
    this.isDragging = false;
  }

  onWheel(event: WheelEvent) {
    if (event.ctrlKey || event.deltaY) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      const newScale = this.scale + delta;
      
      if (newScale >= 0.5 && newScale <= 3) {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        if (newScale > this.scale) {
          this.translateX -= (mouseX - this.translateX) * 0.1;
          this.translateY -= (mouseY - this.translateY) * 0.1;
        } else {
          this.translateX += (mouseX - this.translateX) * 0.1;
          this.translateY += (mouseY - this.translateY) * 0.1;
        }
        
        this.scale = newScale;
        this.constrainPan();
      }
    }
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.lastTouchDistance = this.getTouchDistance(event.touches);
    } else if (event.touches.length === 1 && this.scale > 1) {
      this.isDragging = true;
      this.startX = event.touches[0].clientX - this.translateX;
      this.startY = event.touches[0].clientY - this.translateY;
    }
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) {
      const currentDistance = this.getTouchDistance(event.touches);
      const distanceDiff = currentDistance - this.lastTouchDistance;
      
      if (Math.abs(distanceDiff) > 10) {
        const zoomDelta = (distanceDiff > 0) ? 0.1 : -0.1;
        const newScale = this.scale + zoomDelta;
        
        if (newScale >= 0.5 && newScale <= 3) {
          this.scale = newScale;
        }
        
        this.lastTouchDistance = currentDistance;
      }
    } else if (event.touches.length === 1 && this.isDragging) {
      this.translateX = event.touches[0].clientX - this.startX;
      this.translateY = event.touches[0].clientY - this.startY;
      this.constrainPan();
    }
    event.preventDefault();
  }

  onTouchEnd() {
    this.isDragging = false;
    this.lastTouchDistance = 0;
  }

  private getTouchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private constrainPan() {
    if (!this.capitulo.paginas?.[this.currentPage]) return;
    
    const imageElement = document.querySelector('.manga-page') as HTMLImageElement;
    if (!imageElement) return;

    const containerElement = document.querySelector('.image-container') as HTMLElement;
    if (!containerElement) return;

    const containerRect = containerElement.getBoundingClientRect();
    const scaledWidth = imageElement.width * this.scale;
    const scaledHeight = imageElement.height * this.scale;

    const maxX = (scaledWidth - containerRect.width) / 2;
    const maxY = (scaledHeight - containerRect.height) / 2;

    if (scaledWidth > containerRect.width) {
      this.translateX = Math.min(Math.max(this.translateX, -maxX), maxX);
    } else {
      this.translateX = 0;
    }

    if (scaledHeight > containerRect.height) {
      this.translateY = Math.min(Math.max(this.translateY, -maxY), maxY);
    } else {
      this.translateY = 0;
    }
  }

  get totalPages(): number {
    return this.capitulo.paginas?.length || 0;
  }

  get currentPageUrl(): string {
    if (!this.capitulo.paginas || !this.capitulo.paginas[this.currentPage]) {
      console.warn('URL da página não encontrada');
      return '';
    }
    return this.capitulo.paginas[this.currentPage].imageUrl;
  }

  get imageTransform(): string {
    return `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }
}