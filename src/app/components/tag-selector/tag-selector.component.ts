import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../services/tag.service';
import { Tag, TagSelection } from '../../models/tag.interface';

@Component({
  selector: 'app-tag-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-selector.component.html',
  styleUrls: ['./tag-selector.component.css']
})
export class TagSelectorComponent implements OnInit {
  @Input() selectedTagIds: string[] = [];
  @Output() selectedTagIdsChange = new EventEmitter<string[]>();
  @Output() selectedTagsChange = new EventEmitter<Tag[]>();

  allTags: Tag[] = [];
  tagSelections: TagSelection[] = [];
  filteredTags: TagSelection[] = [];
  searchText: string = '';

  constructor(private tagService: TagService) {}

  ngOnInit() {
    this.loadTags();
  }

  private loadTags() {
    this.tagService.getTags().subscribe(tags => {
      this.allTags = tags;
      this.initializeTagSelections();
    });
  }

  private initializeTagSelections() {
    this.tagSelections = this.allTags.map(tag => ({
      tag,
      selected: this.selectedTagIds.includes(tag.id!)
    }));
    this.filteredTags = [...this.tagSelections];
    this.sortTags();
  }

  private sortTags() {
    this.filteredTags.sort((a, b) => {
      if (a.selected === b.selected) {
        return a.tag.nome.localeCompare(b.tag.nome);
      }
      return a.selected ? -1 : 1;
    });
  }

  onSearch() {
    const searchTerm = this.searchText.toLowerCase().trim();
    this.filteredTags = this.tagSelections.filter(ts => 
      ts.tag.nome.toLowerCase().includes(searchTerm) ||
      ts.tag.descricao?.toLowerCase().includes(searchTerm)
    );
    this.sortTags();
  }

  toggleTag(tagSelection: TagSelection) {
    tagSelection.selected = !tagSelection.selected;
    this.updateSelectedTags();
    this.sortTags();
  }

  removeTag(tag: Tag) {
    const tagSelection = this.tagSelections.find(ts => ts.tag.id === tag.id);
    if (tagSelection) {
      tagSelection.selected = false;
      this.updateSelectedTags();
      this.sortTags();
    }
  }

  private updateSelectedTags() {
    const oldSelectedIds = [...this.selectedTagIds];
    const newSelectedIds = this.tagSelections
      .filter(ts => ts.selected)
      .map(ts => ts.tag.id!);

    this.selectedTagIds = newSelectedIds;
    this.selectedTagIdsChange.emit(this.selectedTagIds);
    this.selectedTagsChange.emit(this.selectedTags);

    // Atualizar contagem de uso das tags
    const addedTags = newSelectedIds.filter(id => !oldSelectedIds.includes(id));
    const removedTags = oldSelectedIds.filter(id => !newSelectedIds.includes(id));
    
    if (addedTags.length > 0 || removedTags.length > 0) {
      this.tagService.updateTagsUsage(addedTags, removedTags).catch(error => {
        console.error('Erro ao atualizar uso das tags:', error);
      });
    }
  }

  get selectedTags(): Tag[] {
    return this.tagSelections
      .filter(ts => ts.selected)
      .map(ts => ts.tag);
  }
}