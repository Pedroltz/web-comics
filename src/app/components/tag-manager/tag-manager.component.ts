import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Tag } from '../../models/tag.interface';

@Component({
  selector: 'app-tag-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-manager.component.html',
  styleUrls: ['./tag-manager.component.css']
})
export class TagManagerComponent implements OnInit {
  private tagService = inject(TagService);
  tags$ = this.tagService.getTags();
  
  novaTag: Partial<Tag> = {
    nome: '',
    descricao: ''
  };
  
  isEditing = false;
  editingId?: string;

  ngOnInit() {}

  async salvarTag() {
    try {
      if (!this.novaTag.nome?.trim()) {
        alert('O nome da tag é obrigatório');
        return;
      }

      if (this.isEditing && this.editingId) {
        await this.tagService.updateTag(this.editingId, this.novaTag);
        alert('Tag atualizada com sucesso!');
      } else {
        await this.tagService.createTag(this.novaTag);
        alert('Tag criada com sucesso!');
      }

      this.resetForm();
    } catch (error) {
      console.error('Erro ao salvar tag:', error);
      alert('Erro ao salvar tag');
    }
  }

  editarTag(tag: Tag) {
    this.isEditing = true;
    this.editingId = tag.id;
    this.novaTag = { ...tag };
  }

  async deletarTag(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta tag?')) return;
    
    try {
      await this.tagService.deleteTag(id);
      alert('Tag excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tag:', error);
      alert('Erro ao excluir tag');
    }
  }

  cancelarEdicao() {
    this.resetForm();
  }

  private resetForm() {
    this.novaTag = {
      nome: '',
      descricao: ''
    };
    this.isEditing = false;
    this.editingId = undefined;
  }
}