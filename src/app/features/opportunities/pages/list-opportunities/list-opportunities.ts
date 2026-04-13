import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { LIST_OPPORTUNITIES_ICONS } from '@shared/data';
import { type IOpportunity, OpportunityLanguage } from '@shared/models';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiAvatar, UiBadge, UiButton, UiConfirmDialog, UiDatepicker, UiSelect } from '@shared/ui';
import { UiTableSkeleton } from '@shared/ui/table-skeleton/table-skeleton';
import { FilterOpportunitiesDto } from '../../dto/filter-opportunities.dto';
import { OpportunitiesStore } from '../../store/opportunities.store';

@Component({
  selector: 'app-list-opportunities',
  templateUrl: './list-opportunities.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OpportunitiesStore],
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ApiImgPipe,
    UiAvatar,
    UiBadge,
    UiButton,
    UiConfirmDialog,
    UiDatepicker,
    UiSelect,
    UiTableSkeleton
  ]
})
export class ListOpportunities {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);
  store = inject(OpportunitiesStore);
  icons = LIST_OPPORTUNITIES_ICONS;
  filters = signal<FilterOpportunitiesDto>({
    from: null,
    to: null,
    language: null
  });
  languageOptions = [
    { label: 'Toutes les langues', value: '' },
    { label: 'Français', value: 'fr' satisfies OpportunityLanguage },
    { label: 'English', value: 'en' satisfies OpportunityLanguage }
  ];
  filterForm: FormGroup = this.fb.group({
    from: [null as Date | null],
    to: [null as Date | null],
    language: ['']
  });

  constructor() {
    effect(() => {
      this.store.loadAll(this.filters());
    });

    this.filterForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.filters.set({
        from: this.toApiDate(value['from']),
        to: this.toApiDate(value['to']),
        language: (value['language'] as OpportunityLanguage | '') || null
      });
    });
  }

  onDelete(opportunity: IOpportunity): void {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer "${opportunity.title}" ?`,
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.delete(opportunity.id);
      }
    });
  }

  onResetFilters(): void {
    this.filterForm.patchValue({
      from: null,
      to: null,
      language: ''
    });
  }

  private toApiDate(value: unknown): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
