import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButton, UiInput, UiTextarea, UiMultiSelect, UiDatepicker, UiTextEditor } from '@shared/ui';
import { ArticlesStore } from '../../store/articles.store';
import { TagsStore } from '../../store/tags.store';

@Component({
  selector: 'app-article-add',
  templateUrl: './add-article.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ArticlesStore, TagsStore],
  imports: [ReactiveFormsModule, UiButton, UiInput, UiTextarea, UiMultiSelect, UiDatepicker, UiTextEditor]
})
export class AddArticle {
  private readonly fb = inject(FormBuilder);
  store = inject(ArticlesStore);
  tagsStore = inject(TagsStore);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      published_at: [new Date(), Validators.required],
      content: ['', Validators.required],
      summary: ['', Validators.required],
      tags: [[] as string[], Validators.required]
    });
    this.tagsStore.loadUpaginated();
  }

  onAddArticle(): void {
    if (!this.form.valid) return;
    this.store.create(this.form.value);
  }

  onCreateTag(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existingTag = this.tagsStore
      .allTags()
      .find((tag) => tag.name.trim().toLowerCase() === trimmedName.toLowerCase());
    const selectedTags = (this.form.get('tags')?.value as string[]) || [];

    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        this.form.patchValue({ tags: [...selectedTags, existingTag.id] });
      }
      return;
    }

    this.tagsStore.create({
      payload: { name: trimmedName },
      onSuccess: (tag) => {
        const updatedTags = (this.form.get('tags')?.value as string[]) || [];
        if (!updatedTags.includes(tag.id)) {
          this.form.patchValue({ tags: [...updatedTags, tag.id] });
        }
      }
    });
  }
}
