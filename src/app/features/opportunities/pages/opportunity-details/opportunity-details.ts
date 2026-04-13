import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { OPPORTUNITY_DETAILS_ICONS } from '@shared/data';
import { ConfirmationService } from '@shared/services/confirmation';
import { UiButton, UiConfirmDialog, UiTabs } from '@shared/ui';
import { OpportunityCover } from '../../components/opportunity-cover/opportunity-cover';
import { OpportunitySheet } from '../../components/opportunity-sheet/opportunity-sheet';
import { OpportunityUpdate } from '../../components/opportunity-update/opportunity-update';
import { OpportunitiesStore } from '../../store/opportunities.store';

@Component({
  selector: 'app-opportunity-details',
  templateUrl: './opportunity-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OpportunitiesStore],
  imports: [
    LucideAngularModule,
    OpportunityCover,
    OpportunitySheet,
    OpportunityUpdate,
    UiButton,
    UiConfirmDialog,
    UiTabs
  ]
})
export class OpportunityDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly slug = this.route.snapshot.params['slug'];
  store = inject(OpportunitiesStore);
  icons = OPPORTUNITY_DETAILS_ICONS;
  activeTab = signal('details');
  tabs = [
    { label: 'Détails', name: 'details', icon: this.icons.FileText },
    { label: 'Modifier', name: 'edit', icon: this.icons.SquarePen },
    { label: 'Couverture', name: 'cover', icon: this.icons.Image }
  ];
  private deleteRequested = signal(false);

  constructor() {
    this.store.loadOne(this.slug);

    effect(() => {
      if (this.deleteRequested() && !this.store.isLoading() && !this.store.opportunity()) {
        this.router.navigate(['/opportunities']);
      }
    });
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  onDelete(): void {
    const opportunity = this.store.opportunity();
    if (!opportunity) return;

    this.confirmationService.confirm({
      header: 'Confirmation',
      message: `Êtes-vous sûr de vouloir supprimer "${opportunity.title}" ?`,
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      accept: () => {
        this.deleteRequested.set(true);
        this.store.delete(opportunity.id);
      }
    });
  }

  onCoverUploaded(): void {
    this.store.loadOne(this.slug);
  }
}
