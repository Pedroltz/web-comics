import { Injectable } from '@angular/core';
import { 
  Firestore,
  collection,
  doc,
  collectionData,
  docData,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Manga } from '../models/manga.interface';
import { HistoricoLeitura } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  constructor(private firestore: Firestore) {}

  getMangas(): Observable<Manga[]> {
    const mangasRef = collection(this.firestore, 'mangas');
    return collectionData(mangasRef, { idField: 'id' }) as Observable<Manga[]>;
  }

  getMangaById(id: string): Observable<Manga | null> {
    const mangaRef = doc(this.firestore, `mangas/${id}`);
    return docData(mangaRef, { idField: 'id' }) as Observable<Manga>;
  }

  async adicionarFavorito(userId: string, mangaId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, {
      favoritos: arrayUnion(mangaId)
    });
  }

  async removerFavorito(userId: string, mangaId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, {
      favoritos: arrayRemove(mangaId)
    });
  }

  async atualizarHistorico(userId: string, historicoLeitura: HistoricoLeitura) {
    const userRef = doc(this.firestore, `users/${userId}`);
    return updateDoc(userRef, {
      historico: arrayUnion(historicoLeitura)
    });
  }
}