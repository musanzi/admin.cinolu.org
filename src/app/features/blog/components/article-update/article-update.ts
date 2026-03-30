import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButton, UiInput, UiMultiSelect, UiTextEditor } from '@shared/ui';
import { IArticle } from '@shared/models';
import { ArticlesStore } from '../../store/articles.store';
import { TagsStore } from '../../store/tags.store';

@Component({
  selector: 'app-article-update',
  templateUrl: './article-update.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ArticlesStore, TagsStore],
  imports: [ReactiveFormsModule, UiButton, UiInput, UiMultiSelect, UiTextEditor]
})
export class ArticleUpdate implements OnInit {
  article = input.required<IArticle>();
  private readonly fb = inject(FormBuilder);
  updateStore = inject(ArticlesStore);
  tagsStore = inject(TagsStore);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: ['', Validators.required],
      title: ['', Validators.required],
      published_at: [null as Date | null, Validators.required],
      content: ['', Validators.required],
      summary: ['', Validators.required],
      tags: [[] as string[], Validators.required]
    });
  }

  ngOnInit(): void {
    const article = this.article();
    this.form.patchValue({
      ...article,
      published_at: new Date(article.published_at),
      tags: article.tags?.map((c) => c.id)
    });
    this.tagsStore.loadUpaginated();
  }

  onSubmit(): void {
    if (!this.form.valid) return;
    this.updateStore.update(this.form.value);
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
