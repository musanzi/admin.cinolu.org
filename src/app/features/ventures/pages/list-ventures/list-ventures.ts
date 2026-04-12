import { Component, computed, DestroyRef, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LIST_VENTURES_ICONS } from '@shared/data';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VenturesStore } from '../../store/ventures.store';
import { FilterVenturesDto } from '../../dto/filter-ventures.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UiButton, UiPagination, UiBadge, UiConfirmDialog } from '@shared/ui';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { UiAvatar } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-list-ventures',
  templateUrl: './list-ventures.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VenturesStore],
  imports: [
    LucideAngularModule,
    UiButton,
    ReactiveFormsModule,
    RouterLink,
    UiPagination,
    UiTableSkeleton,
    UiBadge,
    ApiImgPipe,
    UiAvatar,
    UiConfirmDialog,
    NgOptimizedImage
  ]
})
export class ListVentures {
  icons = LIST_VENTURES_ICONS;
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  store = inject(VenturesStore);
  itemsPerPage = 20;
  queryParams = signal<FilterVenturesDto>({
    page: this.route.snapshot.queryParamMap.get('page'),
    q: this.route.snapshot.queryParamMap.get('q')
  });
  searchForm: FormGroup = this.fb.group({
    q: [this.queryParams().q || '']
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
}
