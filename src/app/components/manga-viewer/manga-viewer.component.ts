import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Capitulo } from '../../models/manga.interface';

@Component({
  selector: 'app-manga-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manga-viewer.component.html',
  styleUrls: ['./manga-viewer.component.css']
})
export class MangaViewerComponent implements OnInit {
  @Input() capitulo!: Capitulo;
  currentPage: number = 0;

  ngOnInit() {
    console.log('MangaViewer - Capítulo recebido:', this.capitulo);
    if (!this.capitulo.paginas) {
      console.warn('Capítulo sem páginas!');
    } else {
      console.log('Número de páginas:', this.capitulo.paginas.length);
    }
  }

  nextPage() {
    if (this.capitulo.paginas && this.currentPage < this.capitulo.paginas.length - 1) {
      this.currentPage++;
      console.log('Próxima página:', this.currentPage);
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      console.log('Página anterior:', this.currentPage);
    }
  }

  goToPage(index: number) {
    if (this.capitulo.paginas && index >= 0 && index < this.capitulo.paginas.length) {
      this.currentPage = index;
      console.log('Indo para página:', index);
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
}