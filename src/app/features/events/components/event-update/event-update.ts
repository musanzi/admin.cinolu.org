import { Component, inject, input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IEvent } from '@shared/models';
import { extractCategoryIds, parseDate } from '@shared/helpers/form.helper';
import { EventsStore } from '../../store/events.store';
import { SubprogramsStore } from '@features/programs/store/subprograms.store';
import { UsersStore } from '@features/users/store/users.store';
import { CategoriesStore } from '../../store/event-categories.store';
import { UiButton, UiDatepicker, UiInput, UiMultiSelect, UiSelect, UiTextarea } from '@shared/ui';

@Component({
  selector: 'app-event-update',
  templateUrl: './event-update.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EventsStore, CategoriesStore, UsersStore, SubprogramsStore],
  imports: [ReactiveFormsModule, UiSelect, UiMultiSelect, UiInput, UiButton, UiTextarea, UiDatepicker]
})
export class EventUpdate implements OnInit {
  event = input.required<IEvent>();
  private readonly fb = inject(FormBuilder);
  store = inject(EventsStore);
  categoriesStore = inject(CategoriesStore);
  programsStore = inject(SubprogramsStore);
  usersStore = inject(UsersStore);
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      place: [''],
      description: ['', Validators.required],
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
  }

  ngOnInit(): void {
    const event = this.event();
    this.form.patchValue({
      ...event,
      started_at: parseDate(event.started_at),
      ended_at: parseDate(event.ended_at),
      program: event.program.id,
      categories: extractCategoryIds(event.categories),
      event_manager: event.event_manager?.id ?? ''
    });
    this.programsStore.loadUnpaginated();
    this.usersStore.loadStaff();
    this.categoriesStore.loadUnpaginated();
  }

  onSubmit(): void {
    if (this.form.valid) this.store.update(this.form.value);
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
