import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Manga, Capitulo } from '../../models/manga.interface';
import { MangaService } from '../../services/manga.service';
import { MangaViewerComponent } from '../../components/manga-viewer/manga-viewer.component';

@Component({
  selector: 'app-manga-detail',
  standalone: true,
  imports: [CommonModule, MangaViewerComponent],
  templateUrl: './manga-detail.component.html',
  styleUrls: ['./manga-detail.component.css']
})
export class MangaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mangaService = inject(MangaService);

  manga$!: Observable<Manga | null>;
  selectedCapitulo?: Capitulo;
  isViewing: boolean = false;

  ngOnInit() {
    const mangaId = this.route.snapshot.paramMap.get('id');
    if (mangaId) {
      this.manga$ = this.mangaService.getMangaById(mangaId).pipe(
        tap(manga => console.log('Mangá carregado:', manga))
      );
    }
  }

  visualizarCapitulo(capitulo: Capitulo) {
    console.log('Visualizando capítulo:', capitulo);
    if (!capitulo.paginas?.length) {
      console.warn('Capítulo sem páginas!');
      return;
    }
    this.selectedCapitulo = capitulo;
    this.isViewing = true;
  }

  fecharVisualizacao() {
    console.log('Fechando visualização');
    this.selectedCapitulo = undefined;
    this.isViewing = false;
  }
}