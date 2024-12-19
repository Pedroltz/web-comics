import { Injectable } from '@angular/core';
import { 
  Firestore,
  collection,
  doc,
  collectionData,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  increment,
  docData,
  writeBatch
} from '@angular/fire/firestore';
import { Observable, of, map, shareReplay, catchError } from 'rxjs';
import { Tag } from '../models/tag.interface';

interface FirestoreTag {
  id?: string;
  nome: string;
  descricao?: string;
  dataCriacao: Timestamp;
  usageCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private readonly tagsCollection = 'tags';
  private tagsCache = new Map<string, Observable<Tag | null>>();
  private allTagsCache$: Observable<Tag[]>;

  constructor(private firestore: Firestore) {
    this.allTagsCache$ = this.initializeTagsCache();
  }

  private initializeTagsCache(): Observable<Tag[]> {
    const tagsRef = collection(this.firestore, this.tagsCollection);
    return collectionData(tagsRef, { idField: 'id' }).pipe(
      map((tags: any[]) => tags.map(tag => ({
        ...tag,
        dataCriacao: tag.dataCriacao?.toDate() || new Date()
      }))),
      shareReplay(1)
    );
  }

  getTags(): Observable<Tag[]> {
    return this.allTagsCache$;
  }

  getTagById(id: string): Observable<Tag | null> {
    if (!this.tagsCache.has(id)) {
      const tagRef = doc(this.firestore, this.tagsCollection, id);
      const tag$ = docData(tagRef, { idField: 'id' }).pipe(
        map((tag: any) => tag ? {
          ...tag,
          dataCriacao: tag.dataCriacao?.toDate() || new Date()
        } : null),
        catchError(() => of(null)),
        shareReplay(1)
      );
      this.tagsCache.set(id, tag$);
    }
    return this.tagsCache.get(id)!;
  }

  async createTag(tag: Partial<Tag>): Promise<string> {
    const newTag = {
      ...tag,
      dataCriacao: Timestamp.now(),
      usageCount: 0
    };
    
    const docRef = await addDoc(
      collection(this.firestore, this.tagsCollection), 
      newTag
    );
    this.invalidateCache();
    return docRef.id;
  }

  async updateTag(id: string, changes: Partial<Tag>): Promise<void> {
    const docRef = doc(this.firestore, this.tagsCollection, id);
    const { dataCriacao, ...updateData } = changes;
    await updateDoc(docRef, updateData);
    this.invalidateCache();
  }

  async deleteTag(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.tagsCollection, id);
    await deleteDoc(docRef);
    this.invalidateCache();
  }

  async updateTagsUsage(addedTags: string[], removedTags: string[]): Promise<void> {
    const batch = writeBatch(this.firestore);

    addedTags.forEach(tagId => {
      const tagRef = doc(this.firestore, this.tagsCollection, tagId);
      batch.update(tagRef, { usageCount: increment(1) });
    });

    removedTags.forEach(tagId => {
      const tagRef = doc(this.firestore, this.tagsCollection, tagId);
      batch.update(tagRef, { usageCount: increment(-1) });
    });

    await batch.commit();
    this.invalidateCache();
  }

  private invalidateCache(): void {
    this.tagsCache.clear();
    this.allTagsCache$ = this.initializeTagsCache();
  }
}