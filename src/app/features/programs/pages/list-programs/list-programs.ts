import { Component, computed, DestroyRef, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LIST_PROGRAMS_ICONS } from '@shared/data';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProgramsStore } from '../../store/programs.store';
import { FilterProgramsDto } from '../../dto/programs/filter-programs.dto';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { UiAvatar, UiButton, UiConfirmDialog, UiTabs, UiPagination, UiBadge } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { ConfirmationService } from '@shared/services/confirmation';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-list-programs',
  templateUrl: './list-programs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ProgramsStore],
  imports: [
    LucideAngularModule,
    UiButton,
    ReactiveFormsModule,
    UiConfirmDialog,
    ApiImgPipe,
    UiAvatar,
    RouterLink,
    UiTabs,
    UiPagination,
    UiTableSkeleton,
    UiBadge,
    DatePipe
  ]
})
export class ListPrograms {
  icons = LIST_PROGRAMS_ICONS;
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  store = inject(ProgramsStore);
  queryParams = signal<FilterProgramsDto>({
    page: this.route.snapshot.queryParamMap.get('page'),
    q: this.route.snapshot.queryParamMap.get('q'),
    filter: this.route.snapshot.queryParamMap.get('filter')
  });
  searchForm: FormGroup = this.fb.group({
    q: [this.queryParams().q || '']
  });
  itemsPerPage = 10;
  activeTab = computed(() => this.queryParams().filter || 'all');
  tabsConfig = signal([
    { label: 'Tous', name: 'all' },
    { label: 'Publiés', name: 'published' },
    { label: 'Brouillons', name: 'drafts' },
    { label: 'En vedette', name: 'highlighted' }
  ]);

  currentPage = (): number => {
    const page = this.queryParams().page;
    return page ? parseInt(page, 10) : 1;
  };

  constructor() {
    effect(() => {
      this.updateRouteAndPrograms();
    });
    const searchValue = this.searchForm.get('q');
    searchValue?.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((searchValue: string) => {
        this.queryParams.update((qp) => ({ ...qp, q: searchValue, page: null }));
      });
  }

  onTabChange(tabName: string): void {
    this.searchForm.patchValue({ q: '' });
    this.queryParams.update((qp) => ({
      ...qp,
      page: null,
      filter: tabName === 'all' ? null : tabName
    }));
  }

  onPageChange(currentPage: number): void {
    this.searchForm.patchValue({ q: '' });

    this.queryParams.update((qp) => ({
      ...qp,
      page: currentPage === 1 ? null : currentPage.toString()
    }));
  }

  onFileUploadLoaded(): void {
    this.store.loadAll(this.queryParams());
  }

  onResetFilters(): void {
    this.searchForm.patchValue({ q: '' });
    this.queryParams.set({ page: null, q: null, filter: null });
  }

  onDelete(roleId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmer la suppression',
      message: 'Etes-vous sûr de vouloir supprimer ce programme ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(roleId);
      }
    });
  }

  updateRouteAndPrograms(): void {
    this.store.loadAll(this.queryParams());
  }
}
