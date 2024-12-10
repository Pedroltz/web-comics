export interface Manga {
    id?: string;
    titulo: string;
    descricao: string;
    autor: string;
    generos: string[];
    imageUrl: string;
    capitulos: Capitulo[];
    animeAdaptacao?: AnimeInfo;
  }
  
  export interface Capitulo {
    numero: number;
    titulo: string;
    dataPublicacao: Date;
    url: string;
  }
  
  export interface AnimeInfo {
    titulo: string;
    temporadas: number;
    episodios: number;
    status: 'Em andamento' | 'Finalizado';
  }