import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventsStore } from '../../store/events.store';
import { SubprogramsStore } from '@features/programs/store/subprograms.store';
import { UsersStore } from '@features/users/store/users.store';
import { CategoriesStore } from '../../store/event-categories.store';
import { UiButton, UiDatepicker, UiInput, UiMultiSelect, UiSelect, UiTextarea } from '@shared/ui';

@Component({
  selector: 'app-event-add',
  templateUrl: './add-event.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EventsStore, SubprogramsStore, UsersStore, CategoriesStore],
  imports: [UiSelect, UiMultiSelect, UiButton, UiTextarea, UiInput, UiDatepicker, ReactiveFormsModule]
})
export class AddEventComponent {
  private readonly fb = inject(FormBuilder);
  store = inject(EventsStore);
  categoriesStore = inject(CategoriesStore);
  programsStore = inject(SubprogramsStore);
  usersStore = inject(UsersStore);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      place: [''],
      context: [''],
      objectives: [''],
      duration_hours: [null, Validators.required],
      selection_criteria: [''],
      started_at: [null as Date | null, Validators.required],
      ended_at: [null as Date | null, Validators.required],
      program: ['', Validators.required],
      categories: [[] as string[], Validators.required],
      event_manager: ['']
    });
    this.programsStore.loadUnpaginated();
    this.categoriesStore.loadUnpaginated();
    this.usersStore.loadStaff();
  }

  onAddEvent(): void {
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
