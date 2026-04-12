import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { PROGRAM_SECTORS_ICONS } from '@shared/data';
import { ISector } from '@shared/models';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiBadge, UiButton, UiConfirmDialog, UiInput, UiPagination } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { ProgramSectorsStore } from '../../store/program-sectors.store';

@Component({
  selector: 'app-program-sectors',
  templateUrl: './program-sectors.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProgramSectorsStore],
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    UiBadge,
    UiButton,
    UiConfirmDialog,
    UiInput,
    UiPagination,
    UiTableSkeleton
  ]
})
export class ProgramSectors {
  icons = PROGRAM_SECTORS_ICONS;
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  store = inject(ProgramSectorsStore);
  itemsPerPage = 10;
  currentPage = signal(1);
  isCreating = signal(false);
  editingSectorId = signal<string | null>(null);
  searchForm: FormGroup = this.fb.group({
    q: ['']
  });
  createForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  updateForm: FormGroup = this.fb.group({
    name: ['', Validators.required]
  });
  searchTerm = signal('');
  filteredSectors = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const sectors = this.store.sectors();
    if (!query) return sectors;
    return sectors.filter((sector) => sector.name.toLowerCase().includes(query));
  });
  sectorCount = computed(() => this.filteredSectors().length);
  paginatedSectors = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage;
    return this.filteredSectors().slice(start, start + this.itemsPerPage);
  });

  constructor() {
    this.store.loadAll();
    effect(() => {
      const page = this.currentPage();
      const totalPages = Math.max(1, Math.ceil(this.sectorCount() / this.itemsPerPage));
      if (page > totalPages) {
        this.currentPage.set(totalPages);
      }
    });
    this.searchForm
      .get('q')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => {
        this.searchTerm.set(value ?? '');
        this.currentPage.set(1);
      });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onResetFilters(): void {
    this.searchForm.patchValue({ q: '' });
    this.searchTerm.set('');
    this.currentPage.set(1);
  }

  onToggleCreation(): void {
    const next = !this.isCreating();
    this.isCreating.set(next);
    if (!next) {
      this.createForm.reset({ name: '' });
    }
  }

  onCancelCreation(): void {
    this.isCreating.set(false);
    this.createForm.reset({ name: '' });
  }

  onCreate(): void {
    if (this.createForm.invalid) return;
    const { name } = this.createForm.getRawValue();
    this.store.create({
      payload: { name },
      onSuccess: () => this.onCancelCreation()
    });
  }

  onEdit(sector: ISector): void {
    this.editingSectorId.set(sector.id);
    this.updateForm.patchValue({ name: sector.name });
  }

  onCancelUpdate(): void {
    this.editingSectorId.set(null);
    this.updateForm.reset({ name: '' });
  }

  onUpdate(): void {
    const sectorId = this.editingSectorId();
    if (this.updateForm.invalid || !sectorId) return;
    const { name } = this.updateForm.getRawValue();
    this.store.update({
      id: sectorId,
      payload: { name },
      onSuccess: () => this.onCancelUpdate()
    });
  }

  isEditing(sectorId: string): boolean {
    return this.editingSectorId() === sectorId;
  }

  onDelete(sectorId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer ce secteur ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(sectorId);
      }
    });
  }
}
