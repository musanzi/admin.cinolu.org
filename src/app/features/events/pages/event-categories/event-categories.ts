import { Component, computed, DestroyRef, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Trash, Search, Funnel, Pencil } from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory } from '@shared/models';
import { FilterEventCategoriesDto } from '../../dto/categories/filter-categories.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CategoriesStore } from '../../store/event-categories.store';
import { UiButton, UiConfirmDialog, UiPagination, UiBadge } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiInput } from '@shared/ui/form/input/input';

@Component({
  selector: 'app-event-categories',
  templateUrl: './event-categories.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CategoriesStore, ConfirmationService],
  imports: [
    LucideAngularModule,
    UiButton,
    ReactiveFormsModule,
    UiConfirmDialog,
    UiPagination,
    UiTableSkeleton,
    UiInput,
    UiBadge
  ]
})
export class EventCategories {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  store = inject(CategoriesStore);
  queryParams = signal<FilterEventCategoriesDto>({
    page: this.route.snapshot.queryParamMap.get('page'),
    q: this.route.snapshot.queryParamMap.get('q')
  });
  icons = { Pencil, Trash, Search, Funnel };
  itemsPerPage = 20;
  isCreating = signal(false);
  editingCategoryId = signal<string | null>(null);
  currentPage = computed(() => Number(this.queryParams().page) || 1);
  searchForm: FormGroup = this.fb.group({
    q: [this.queryParams().q || '']
  });
  createForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  updateForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      this.store.loadAll(this.queryParams());
    });
    const searchValue = this.searchForm.get('q');
    searchValue?.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue: string) => {
        this.queryParams.update((qp) => ({ ...qp, q: searchValue, page: null }));
      });
  }

  onPageChange(currentPage: number): void {
    this.queryParams.update((qp) => ({
      ...qp,
      page: currentPage === 1 ? null : currentPage.toString()
    }));
  }

  onResetFilters(): void {
    this.searchForm.patchValue({ q: '' });
    this.queryParams.update((qp) => ({ ...qp, q: null, page: null }));
  }

  onToggleCreation(): void {
    this.isCreating.update((visible) => !visible);
    if (!this.isCreating()) {
      this.createForm.reset({ name: '' });
    }
  }

  onCancelCreation(): void {
    this.isCreating.set(false);
    this.createForm.reset({ name: '' });
  }

  onCreate(): void {
    if (this.createForm.invalid) return;
    const { name } = this.createForm.value;
    this.store.create({
      payload: { name },
      onSuccess: () => this.onCancelCreation()
    });
  }

  onEdit(category: ICategory): void {
    this.editingCategoryId.set(category.id);
    this.updateForm.patchValue({ name: category.name });
  }

  onCancelUpdate(): void {
    this.editingCategoryId.set(null);
    this.updateForm.reset({ name: '' });
  }

  onUpdate(): void {
    if (this.updateForm.invalid) return;
    const { name } = this.updateForm.value;
    this.store.update({
      id: this.editingCategoryId() || '',
      payload: { name },
      onSuccess: () => this.onCancelUpdate()
    });
  }

  isEditing(categoryId: string): boolean {
    return this.editingCategoryId() === categoryId;
  }

  onDelete(categoryId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete({ id: categoryId });
      }
    });
  }
}
