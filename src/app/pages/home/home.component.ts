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
  imports: [CommonModule, FormsModule, RouterModule],
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
    temAnime: false
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
      temAnime: false
    };
    this.generosInput = '';
    this.isEditing = false;
    this.editingId = undefined;
  }

  handleAnimeToggle(event: any) {
    const hasAnime = event.target.checked;
    this.novoManga.temAnime = hasAnime;
    
    if (!hasAnime) {
      delete this.novoManga.animeAdaptacao;
    } else {
      this.novoManga.animeAdaptacao = {
        titulo: '',
        temporadas: 1,
        episodios: 1,
        status: 'Em andamento'
      };
    }
  }

  async registrarManga() {
    try {
      // Validar apenas campos básicos obrigatórios
      if (!this.novoManga.titulo || !this.novoManga.descricao || !this.novoManga.autor || !this.novoManga.imageUrl) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      // Preparar dados para salvar
      this.novoManga.generos = this.generosInput.split(',').map(g => g.trim());
      const mangaCollection = collection(this.firestore, 'mangas');
      
      // Criar uma cópia do objeto para manipulação
      const mangaData = { ...this.novoManga };
      
      // Limpar os dados relacionados ao anime quando não houver adaptação
      if (!mangaData.temAnime) {
        mangaData.animeAdaptacao = null;
      }

      if (this.isEditing && this.editingId) {
        const mangaRef = doc(this.firestore, 'mangas', this.editingId);
        delete (mangaData as any).id;
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
      temAnime: manga.temAnime || false
    };
    
    if (manga.animeAdaptacao) {
      this.novoManga.animeAdaptacao = { ...manga.animeAdaptacao };
    }
    
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