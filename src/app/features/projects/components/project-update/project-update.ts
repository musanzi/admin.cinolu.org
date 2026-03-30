import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiButton, UiDatepicker, UiInput, UiMultiSelect, UiSelect, UiTextarea } from '@shared/ui';
import { ICategory, IProject, ISubprogram, IUser } from '@shared/models';
import { extractCategoryIds, parseDate } from '@shared/helpers/form.helper';
import { ProjectsStore } from '../../store/projects.store';
import { CategoriesStore } from '../../store/project-categories.store';

@Component({
  selector: 'app-project-update',
  templateUrl: './project-update.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProjectsStore, CategoriesStore],
  imports: [ReactiveFormsModule, UiInput, UiTextarea, UiSelect, UiMultiSelect, UiDatepicker, UiButton]
})
export class ProjectUpdate implements OnInit {
  project = input.required<IProject>();
  programs = input.required<ISubprogram[]>();
  staff = input.required<IUser[]>();
  categories = input.required<ICategory[]>();
  private readonly fb = inject(FormBuilder);
  updateProjectStore = inject(ProjectsStore);
  categoriesStore = inject(CategoriesStore);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      context: [''],
      objectives: [''],
      duration_hours: [null, Validators.required],
      selection_criteria: [''],
      started_at: [null as Date | null, Validators.required],
      ended_at: [null as Date | null, Validators.required],
      program: ['', Validators.required],
      categories: [[] as string[], Validators.required],
      project_manager: [null]
    });
  }

  ngOnInit(): void {
    const project = this.project();
    this.form.patchValue({
      ...project,
      started_at: parseDate(project.started_at),
      ended_at: parseDate(project.ended_at),
      program: project.program.id,
      categories: extractCategoryIds(project.categories),
      project_manager: project.project_manager?.id
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;
    this.updateProjectStore.update(this.form.value);
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
