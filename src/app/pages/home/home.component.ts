import { Component, OnInit, OnDestroy, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  Firestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter
} from '@angular/fire/firestore';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FileUploadService } from '../../services/file-upload.service';
import { TagService } from '../../services/tag.service';
import { Manga, Capitulo } from '../../models/manga.interface';
import { Tag } from '../../models/tag.interface';
import { TagSelectorComponent } from '../../components/tag-selector/tag-selector.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TagSelectorComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private fileUploadService = inject(FileUploadService);
  private tagService = inject(TagService);
  private destroy$ = new Subject<void>();
  private readonly pageSize = 10;
  private mangasSubject = new BehaviorSubject<Manga[]>([]);
  private loadedMangaIds = new Set<string>();
  private lastVisible: any = null;
  private isLoadingMore = false;
  private allLoaded = false;

  mangas$ = this.mangasSubject.asObservable();
  loading = false;
  isEditing = false;
  editingId?: string;
  generosInput = '';

  novoManga: Manga = {
    titulo: '',
    descricao: '',
    autor: '',
    imageUrl: '',
    generos: [],
    tagIds: [],
    capitulos: [],
    temAnime: false
  };

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.mangasSubject.complete();
  }

  @HostListener('window:scroll')
  async onScroll(): Promise<void> {
    if (this.isLoadingMore || this.allLoaded) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollPosition >= documentHeight - 500) {
      await this.loadMoreMangas();
    }
  }

  private async loadInitialData(): Promise<void> {
    this.loading = true;
    try {
      const mangaCollection = collection(this.firestore, 'mangas');
      const q = query(
        mangaCollection,
        orderBy('titulo'),
        limit(this.pageSize)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const mangas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Manga));

        this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        
        this.loadedMangaIds.clear();
        mangas.forEach(manga => this.loadedMangaIds.add(manga.id!));
        
        this.mangasSubject.next(mangas);
      } else {
        this.allLoaded = true;
      }
    } catch (error) {
      console.error('Erro ao carregar mangás:', error);
    } finally {
      this.loading = false;
    }
  }

  private async loadMoreMangas(): Promise<void> {
    if (this.isLoadingMore || this.allLoaded || !this.lastVisible) return;

    this.isLoadingMore = true;
    this.loading = true;

    try {
      const mangaCollection = collection(this.firestore, 'mangas');
      const q = query(
        mangaCollection,
        orderBy('titulo'),
        startAfter(this.lastVisible),
        limit(this.pageSize)
      );

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const newMangas = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Manga))
          .filter(manga => !this.loadedMangaIds.has(manga.id!));

        if (newMangas.length > 0) {
          newMangas.forEach(manga => this.loadedMangaIds.add(manga.id!));
          const currentMangas = this.mangasSubject.value;
          this.mangasSubject.next([...currentMangas, ...newMangas]);
          this.lastVisible = snapshot.docs[snapshot.docs.length - 1];
        }
      } else {
        this.allLoaded = true;
      }
    } catch (error) {
      console.error('Erro ao carregar mais mangás:', error);
    } finally {
      this.loading = false;
      this.isLoadingMore = false;
    }
  }

  getTag(tagId: string): Observable<Tag | null> {
    return this.tagService.getTagById(tagId).pipe(
      takeUntil(this.destroy$)
    );
  }

  onTagsSelected(tags: Tag[]): void {
    this.novoManga.tagIds = tags.map(tag => tag.id!);
  }

  handleAnimeToggle(event: Event): void {
    const hasAnime = (event.target as HTMLInputElement).checked;
    this.novoManga.temAnime = hasAnime;

    this.novoManga.animeAdaptacao = hasAnime ? {
      titulo: '',
      temporadas: 1,
      episodios: 1,
      status: 'Em andamento'
    } : undefined;
  }

  adicionarCapitulo(): void {
    const novoCapitulo: Capitulo = {
      numero: this.novoManga.capitulos.length + 1,
      titulo: '',
      dataPublicacao: new Date(),
      url: '',
      paginas: []
    };
    this.novoManga.capitulos.push(novoCapitulo);
  }

  removerCapitulo(index: number): void {
    this.novoManga.capitulos.splice(index, 1);
    this.novoManga.capitulos.forEach((cap, idx) => {
      cap.numero = idx + 1;
    });
  }

  async handlePageUpload(event: Event, capituloIndex: number): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    try {
      const files = Array.from(input.files);
      const urls = await this.fileUploadService.uploadMultipleFiles(
        files,
        this.editingId || 'temp',
        this.novoManga.capitulos[capituloIndex].numero
      );

      this.novoManga.capitulos[capituloIndex].paginas = urls.map((url, index) => ({
        numero: index + 1,
        imageUrl: url
      }));
    } catch (error) {
      console.error('Erro ao fazer upload das páginas:', error);
      alert('Erro ao fazer upload das páginas');
    }
  }

  async registrarManga(): Promise<void> {
    try {
      if (!this.validarManga()) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const mangaData = {
        ...this.novoManga,
        generos: this.generosInput
          .split(',')
          .map(g => g.trim())
          .filter(g => g.length > 0)
      };

      if (this.isEditing && this.editingId) {
        const mangaRef = doc(this.firestore, 'mangas', this.editingId);
        await updateDoc(mangaRef, mangaData);
        
        const currentMangas = this.mangasSubject.value;
        const updatedMangas = currentMangas.map(m => 
          m.id === this.editingId ? { ...mangaData, id: this.editingId } : m
        );
        this.mangasSubject.next(updatedMangas);
        
        alert('Mangá atualizado com sucesso!');
      } else {
        const mangaCollection = collection(this.firestore, 'mangas');
        const docRef = await addDoc(mangaCollection, mangaData);
        
        const newManga = { ...mangaData, id: docRef.id };
        this.loadedMangaIds.add(docRef.id);
        this.mangasSubject.next([newManga, ...this.mangasSubject.value]);
        
        alert('Mangá criado com sucesso!');
      }

      this.resetForm();
    } catch (error) {
      console.error('Erro ao processar mangá:', error);
      alert('Erro ao processar mangá');
    }
  }

  async excluirManga(id: string): Promise<void> {
    if (!confirm('Tem certeza que deseja excluir este mangá?')) return;

    try {
      const mangaRef = doc(this.firestore, 'mangas', id);
      await deleteDoc(mangaRef);
      
      this.loadedMangaIds.delete(id);
      const currentMangas = this.mangasSubject.value;
      this.mangasSubject.next(currentMangas.filter(m => m.id !== id));
      
      alert('Mangá excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir mangá:', error);
      alert('Erro ao excluir mangá');
    }
  }

  private validarManga(): boolean {
    return !!(
      this.novoManga.titulo?.trim() &&
      this.novoManga.descricao?.trim() &&
      this.novoManga.autor?.trim() &&
      this.novoManga.imageUrl?.trim()
    );
  }

  editarManga(manga: Manga): void {
    this.isEditing = true;
    this.editingId = manga.id;
    this.novoManga = { ...manga };
    this.generosInput = manga.generos.join(', ');
  }

  resetForm(): void {
    this.novoManga = {
      titulo: '',
      descricao: '',
      autor: '',
      imageUrl: '',
      generos: [],
      tagIds: [],
      capitulos: [],
      temAnime: false
    };
    this.generosInput = '';
    this.isEditing = false;
    this.editingId = undefined;
  }

  cancelarEdicao(): void {
    this.resetForm();
  }
}