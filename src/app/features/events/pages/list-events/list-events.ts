import { Component, computed, DestroyRef, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LIST_EVENTS_ICONS } from '@shared/data';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventsStore } from '../../store/events.store';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { FilterEventsDto } from '../../dto/events/filter-events.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { UiAvatar, UiButton, UiConfirmDialog, UiPagination, UiTabs, UiBadge } from '@shared/ui';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-events-list',
  templateUrl: './list-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EventsStore],
  imports: [
    LucideAngularModule,
    DatePipe,
    UiButton,
    ReactiveFormsModule,
    RouterLink,
    UiConfirmDialog,
    UiAvatar,
    ApiImgPipe,
    UiTabs,
    UiPagination,
    UiTableSkeleton,
    UiBadge
  ]
})
export class ListEvents {
  icons = LIST_EVENTS_ICONS;
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  store = inject(EventsStore);
  itemsPerPage = 20;
  queryParams = signal<FilterEventsDto>({
    page: this.route.snapshot.queryParamMap.get('page'),
    q: this.route.snapshot.queryParamMap.get('q'),
    filter: this.route.snapshot.queryParamMap.get('filter')
  });
  activeTab = computed(() => this.queryParams().filter || 'all');
  currentPage = computed(() => Number(this.queryParams().page) || 1);
  searchForm: FormGroup = this.fb.group({
    q: [this.queryParams().q || '']
  });
  tabsConfig = signal([
    { label: 'Tous', name: 'all' },
    { label: 'Publiés', name: 'published' },
    { label: 'Brouillons', name: 'drafts' },
    { label: 'En vedette', name: 'highlighted' }
  ]);

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

  onTabChange(tabName: string): void {
    this.queryParams.update((qp) => ({ ...qp, filter: tabName, page: null }));
  }

  onPageChange(currentPage: number): void {
    this.queryParams.update((qp) => ({
      ...qp,
      page: currentPage === 1 ? null : currentPage.toString()
    }));
  }

  onResetFilters(): void {
    this.searchForm.patchValue({ q: '' });
    this.queryParams.update((qp) => ({ ...qp, q: null, page: null, filter: 'all' }));
  }

  onDelete(eventId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer cet événement ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(eventId);
      }
    });
  }
}
