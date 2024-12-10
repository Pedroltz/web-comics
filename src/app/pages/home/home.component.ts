import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Manga, Capitulo, AnimeInfo } from '../../models/manga.interface';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
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
    animeAdaptacao: {
      titulo: '',
      temporadas: 0,
      episodios: 0,
      status: 'Em andamento'
    }
  };

  constructor(private firestore: Firestore) {
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
      animeAdaptacao: {
        titulo: '',
        temporadas: 0,
        episodios: 0,
        status: 'Em andamento'
      }
    };
    this.generosInput = '';
    this.isEditing = false;
    this.editingId = undefined;
  }

  async registrarManga() {
    this.novoManga.generos = this.generosInput.split(',').map(g => g.trim());
    
    try {
      const mangaCollection = collection(this.firestore, 'mangas');
      
      if (this.isEditing && this.editingId !== undefined) {
        // Update existing manga
        const mangaRef = doc(this.firestore, 'mangas', this.editingId);
        const mangaData = { ...this.novoManga };
        delete mangaData.id; // Remove id before update
        await updateDoc(mangaRef, mangaData);
        alert('Mangá atualizado com sucesso!');
      } else {
        // Add new manga
        await addDoc(mangaCollection, this.novoManga);
        alert('Mangá registrado com sucesso!');
      }
      
      this.resetForm();
    } catch (error) {
      console.error('Erro ao processar mangá:', error);
      alert('Erro ao processar mangá');
    }
  }

  editarManga(manga: Manga) {
    this.isEditing = true;
    this.editingId = manga.id;
    this.novoManga = {
      titulo: manga.titulo,
      descricao: manga.descricao,
      autor: manga.autor,
      imageUrl: manga.imageUrl,
      generos: manga.generos,
      capitulos: manga.capitulos,
      animeAdaptacao: manga.animeAdaptacao || {
        titulo: '',
        temporadas: 0,
        episodios: 0,
        status: 'Em andamento'
      }
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
      url: ''
    };
    this.novoManga.capitulos.push(novoCapitulo);
  }

  removerCapitulo(index: number) {
    this.novoManga.capitulos.splice(index, 1);
  }

  cancelarEdicao() {
    this.resetForm();
  }
}