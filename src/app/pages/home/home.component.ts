import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Manga, Capitulo, AnimeInfo, Pagina } from '../../models/manga.interface';
import { FileUploadService } from '../../services/file-upload.service';
import { MangaViewerComponent } from '../../components/manga-viewer/manga-viewer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MangaViewerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private firestore: Firestore = inject(Firestore);
  private fileUploadService: FileUploadService = inject(FileUploadService);

  mangas$: Observable<Manga[]>;
  generosInput: string = '';
  isEditing: boolean = false;
  editingId?: string;
  
  novoManga: Manga = {
    titulo: '',
    descricao: '',
    autor: '',
    imageUrl: '',
    generos: [],
    capitulos: [],
    temAnime: false,
    animeAdaptacao: undefined
  };

  constructor() {
    const mangaCollection = collection(this.firestore, 'mangas');
    this.mangas$ = collectionData(mangaCollection, { idField: 'id' }) as Observable<Manga[]>;
  }

  ngOnInit() {}

  resetForm() {
    this.novoManga = {
      titulo: '',
      descricao: '',
      autor: '',
      imageUrl: '',
      generos: [],
      capitulos: [],
      temAnime: false,
      animeAdaptacao: undefined
    };
    this.generosInput = '';
    this.isEditing = false;
    this.editingId = undefined;
  }

  handleAnimeToggle(event: any) {
    const hasAnime = event.target.checked;
    this.novoManga.temAnime = hasAnime;
    
    if (hasAnime) {
      this.novoManga.animeAdaptacao = {
        titulo: '',
        temporadas: 1,
        episodios: 1,
        status: 'Em andamento'
      };
    } else {
      this.novoManga.animeAdaptacao = undefined;
    }
  }

  async registrarManga() {
    try {
      // Validar campos básicos
      if (!this.novoManga.titulo || !this.novoManga.descricao || !this.novoManga.autor || !this.novoManga.imageUrl) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Validar campos do anime apenas se temAnime for true
      if (this.novoManga.temAnime) {
        if (!this.novoManga.animeAdaptacao?.titulo || 
            !this.novoManga.animeAdaptacao?.temporadas || 
            !this.novoManga.animeAdaptacao?.episodios) {
          alert('Por favor, preencha todas as informações do anime.');
          return;
        }
      }

      this.novoManga.generos = this.generosInput.split(',').map(g => g.trim());
      const mangaCollection = collection(this.firestore, 'mangas');
      
      const mangaData = { 
        ...this.novoManga,
        // Se não tem anime, garantir que os campos relacionados sejam undefined
        animeAdaptacao: this.novoManga.temAnime ? this.novoManga.animeAdaptacao : undefined
      };

      if (this.isEditing && this.editingId) {
        const mangaRef = doc(this.firestore, 'mangas', this.editingId);
        delete mangaData.id;
        await updateDoc(mangaRef, mangaData);
        alert('Mangá atualizado com sucesso!');
      } else {
        await addDoc(mangaCollection, mangaData);
        alert('Mangá registrado com sucesso!');
      }
      
      this.resetForm();
    } catch (error) {
      console.error('Erro ao processar mangá:', error);
      alert('Erro ao processar mangá');
    }
  }

  async handlePageUpload(event: Event, capituloIndex: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    
    try {
      const urls = await this.fileUploadService.uploadMultipleFiles(
        files,
        this.editingId || 'temp',
        this.novoManga.capitulos[capituloIndex].numero
      );

      const paginas: Pagina[] = urls.map((url, index) => ({
        numero: index + 1,
        imageUrl: url
      }));

      this.novoManga.capitulos[capituloIndex].paginas = paginas;
    } catch (error) {
      console.error('Erro ao fazer upload das páginas:', error);
      alert('Erro ao fazer upload das páginas');
    }
  }

  editarManga(manga: Manga) {
    this.isEditing = true;
    this.editingId = manga.id;
    
    this.novoManga = {
      ...manga,
      temAnime: manga.temAnime || false,
      animeAdaptacao: manga.animeAdaptacao ? { ...manga.animeAdaptacao } : undefined
    };
    
    this.generosInput = manga.generos.join(', ');
  }

  async excluirManga(id: string) {
    if (confirm('Tem certeza que deseja excluir este mangá?')) {
      try {
        const mangaRef = doc(this.firestore, 'mangas', id);
        await deleteDoc(mangaRef);
        alert('Mangá excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir mangá:', error);
        alert('Erro ao excluir mangá');
      }
    }
  }

  adicionarCapitulo() {
    const novoCapitulo: Capitulo = {
      numero: this.novoManga.capitulos.length + 1,
      titulo: '',
      dataPublicacao: new Date(),
      url: '',
      paginas: []
    };
    this.novoManga.capitulos.push(novoCapitulo);
  }

  removerCapitulo(index: number) {
    this.novoManga.capitulos.splice(index, 1);
    // Reajustar números dos capítulos
    this.novoManga.capitulos.forEach((cap, idx) => {
      cap.numero = idx + 1;
    });
  }

  cancelarEdicao() {
    this.resetForm();
  }
}