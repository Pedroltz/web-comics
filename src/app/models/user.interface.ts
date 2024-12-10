export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    favoritos: string[];
    historico: HistoricoLeitura[];
  }
  
  export interface HistoricoLeitura {
    mangaId: string;
    ultimaLeitura: Date;
    capitulo: number;
  }