import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectsStore } from '../../store/projects.store';
import { CategoriesStore } from '../../store/project-categories.store';
import { SubprogramsStore } from '../../../programs/store/subprograms.store';
import { UsersStore } from '@features/users/store/users.store';
import { UiButton, UiDatepicker, UiInput, UiMultiSelect, UiSelect, UiTextarea } from '@shared/ui';

@Component({
  selector: 'app-project-add',
  templateUrl: './add-project.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProjectsStore, SubprogramsStore, CategoriesStore, UsersStore],
  imports: [UiSelect, UiInput, UiMultiSelect, UiButton, UiDatepicker, UiTextarea, ReactiveFormsModule]
})
export class AddProjectComponent {
  private readonly fb = inject(FormBuilder);
  store = inject(ProjectsStore);
  categoriesStore = inject(CategoriesStore);
  programsStore = inject(SubprogramsStore);
  usersStore = inject(UsersStore);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      context: [''],
      objectives: [''],
      duration_hours: [null],
      selection_criteria: [''],
      started_at: [null as Date | null, Validators.required],
      ended_at: [null as Date | null, Validators.required],
      program: ['', Validators.required],
      categories: [[] as string[], Validators.required],
      project_manager: ['', Validators.required]
    });
    this.programsStore.loadUnpaginated();
    this.categoriesStore.loadUnpaginated();
    this.usersStore.loadStaff();
  }

  onAddProject(): void {
    if (!this.form.valid) return;
    this.store.create(this.form.value);
  }

  onCreateCategory(name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existingCategory = this.categoriesStore
      .allCategories()
      .find((category) => category.name.trim().toLowerCase() === trimmedName.toLowerCase());
    const selectedCategories = (this.form.get('categories')?.value as string[]) ?? [];

    if (existingCategory) {
      if (!selectedCategories.includes(existingCategory.id)) {
        this.form.patchValue({ categories: [...selectedCategories, existingCategory.id] });
      }
      return;
    }

    this.categoriesStore.create({
      payload: { name: trimmedName },
      onSuccess: (category) => {
        if (!selectedCategories.includes(category.id)) {
          this.form.patchValue({ categories: [...selectedCategories, category.id] });
        }
      }
    });
  }
}
