import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  ChangeDetectionStrategy,
  viewChild,
  ElementRef
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LIST_USERS_ICONS } from '@shared/data';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsersStore } from '../../store/users.store';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { FilterUsersDto } from '../../dto/users/filter-users.dto';
import { UiAvatar, UiButton, UiConfirmDialog, UiPagination, UiBadge } from '@shared/ui';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { DatePipe } from '@angular/common';
import { bindSearchControlToQuery, toPageQueryValue } from '@shared/helpers';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UsersStore],
  imports: [
    LucideAngularModule,
    DatePipe,
    UiButton,
    ReactiveFormsModule,
    RouterLink,
    UiConfirmDialog,
    UiAvatar,
    ApiImgPipe,
    UiPagination,
    UiTableSkeleton,
    UiBadge
  ]
})
export class ListUsers {
  icons = LIST_USERS_ICONS;
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  searchForm: FormGroup;
  store = inject(UsersStore);
  itemsPerPage = 50;
  csvFileInput = viewChild<ElementRef<HTMLInputElement>>('csvFileInput');
  queryParams = signal<FilterUsersDto>({
    page: this.route.snapshot.queryParamMap.get('page'),
    q: this.route.snapshot.queryParamMap.get('q')
  });
  currentPage = computed(() => Number(this.queryParams().page) || 1);

  constructor() {
    this.searchForm = this.fb.group({
      q: [this.queryParams().q || '']
    });
    effect(() => {
      this.store.loadAll(this.queryParams());
    });
    bindSearchControlToQuery(this.searchForm.get('q'), this.queryParams, this.destroyRef, 1000);
  }

  onPageChange(currentPage: number): void {
    this.queryParams.update((qp) => ({
      ...qp,
      page: toPageQueryValue(currentPage)
    }));
  }

  onResetFilters(): void {
    this.searchForm.patchValue({ q: '' });
    this.queryParams.update((qp) => ({ ...qp, q: null, page: null }));
  }

  onDownloadUsers(): void {
    this.store.download(this.queryParams());
  }

  onDelete(userId: string): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(userId);
      }
    });
  }

  clear(): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: 'Êtes-vous sûr de vouloir supprimer les utilisateurs invalides ?',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.clear({
          onSuccess: () => this.store.loadAll(this.queryParams())
        });
      }
    });
  }

  triggerCsvFileSelect(): void {
    this.csvFileInput()?.nativeElement?.click();
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file?.name.toLowerCase().endsWith('.csv')) {
      this.store.importCsv({
        file,
        onSuccess: () => this.store.loadAll(this.queryParams())
      });
    }

    input.value = '';
  }
}
