// src/app/models/tag.interface.ts
export interface Tag {
    id?: string;
    nome: string;
    descricao?: string;
    dataCriacao: Date;
    usageCount: number;
}

export interface TagSelection {
    tag: Tag;
    selected: boolean;
}