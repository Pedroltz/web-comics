import { Injectable } from '@angular/core';
import { 
  Firestore,
  collection,
  doc,
  collectionData,
  docData,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Manga } from '../models/manga.interface';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  constructor(private firestore: Firestore) {}

  getMangas(): Observable<Manga[]> {
    const mangasRef = collection(this.firestore, 'mangas');
    return collectionData(mangasRef, { idField: 'id' }).pipe(
      map(mangas => this.processMangas(mangas as Manga[]))
    );
  }

  getMangaById(id: string): Observable<Manga | null> {
    console.log('Buscando mangá com ID:', id);
    const mangaRef = doc(this.firestore, `mangas/${id}`);
    return docData(mangaRef, { idField: 'id' }).pipe(
      map(manga => {
        if (!manga) return null;
        const processed = this.processManga(manga as Manga);
        console.log('Mangá processado:', processed);
        return processed;
      })
    );
  }

  private processManga(manga: Manga): Manga {
    return {
      ...manga,
      capitulos: manga.capitulos.map(cap => ({
        ...cap,
        paginas: Array.isArray(cap.paginas) ? cap.paginas : [],
        dataPublicacao: cap.dataPublicacao ? new Date(cap.dataPublicacao) : new Date()
      }))
    };
  }

  private processMangas(mangas: Manga[]): Manga[] {
    return mangas.map(manga => this.processManga(manga));
  }
}