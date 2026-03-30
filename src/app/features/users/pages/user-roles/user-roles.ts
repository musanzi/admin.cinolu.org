import { Component, computed, DestroyRef, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Trash, Search, Funnel, Pencil } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FilterRolesDto } from '../../dto/roles/filter-roles.dto';
import { RolesStore } from '../../store/roles.store';
import { IRole } from '@shared/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UiButton, UiConfirmDialog, UiInput, UiPagination, UiBadge } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { ConfirmationService } from '@shared/services/confirmation';

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RolesStore],
  imports: [
    LucideAngularModule,
    CommonModule,
    UiInput,
    UiButton,
    ReactiveFormsModule,
    UiConfirmDialog,
    UiPagination,
    UiTableSkeleton,
    UiBadge
  ]
})
export class UserRoles {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  store = inject(RolesStore);
  queryParams = signal<FilterRolesDto>({
    page: this.route.snapshot.queryParamMap.get('page'),
    q: this.route.snapshot.queryParamMap.get('q')
  });
  icons = { Pencil, Trash, Search, Funnel };
  itemsPerPage = 10;
  isCreating = signal(false);
  editingRoleId = signal<string | null>(null);
  searchForm: FormGroup = this.fb.group({
    q: [this.queryParams().q || '']
  });
  createForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  updateForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  currentPage = computed(() => Number(this.queryParams().page) || 1);

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

  onEdit(role: IRole): void {
    this.editingRoleId.set(role.id);
    this.updateForm.patchValue({ name: role.name });
  }

  onCancelUpdate(): void {
    this.editingRoleId.set(null);
    this.updateForm.reset({ name: '' });
  }

  onUpdate(): void {
    if (this.updateForm.invalid) return;
    const { name } = this.updateForm.value;
    this.store.update({
      id: this.editingRoleId() || '',
      payload: { name },
      onSuccess: () => this.onCancelUpdate()
    });
  }

  isEditing(roleId: string): boolean {
    return this.editingRoleId() === roleId;
  }

  onDelete(roleId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce rôle ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(roleId);
      }
    });
  }
}
