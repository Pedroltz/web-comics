// src/app/models/manga.interface.ts

export interface Manga {
  id?: string;
  titulo: string;
  descricao: string;
  autor: string;
  generos: string[];
  tagIds: string[];
  imageUrl: string;
  capitulos: Capitulo[];
  temAnime?: boolean;
  animeAdaptacao?: AnimeInfo | undefined | null;
}

export interface Capitulo {
  numero: number;
  titulo: string;
  dataPublicacao: Date;
  url: string;
  paginas: Pagina[];
}

export interface Pagina {
  numero: number;
  imageUrl: string;
}

export interface AnimeInfo {
  titulo?: string;
  temporadas?: number;
  episodios?: number;
  status?: 'Em andamento' | 'Finalizado';
}