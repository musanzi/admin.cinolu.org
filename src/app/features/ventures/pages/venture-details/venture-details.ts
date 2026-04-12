import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VenturesStore } from '../../store/ventures.store';
import { LucideAngularModule } from 'lucide-angular';
import { VENTURE_DETAILS_ICONS } from '@shared/data';
import { UiBadge, UiConfirmDialog } from '@shared/ui';
import { ConfirmationService } from '@shared/services/confirmation';
import { CurrencyPipe, DatePipe, NgOptimizedImage } from '@angular/common';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { UiAvatar } from '@shared/ui';
import type { IProduct } from '@shared/models';
import { VentureSkeleton } from '@features/ventures/ui/venture-skeleton/venture-skeleton';

@Component({
  selector: 'app-venture-details',
  templateUrl: './venture-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VenturesStore, ConfirmationService],
  imports: [
    LucideAngularModule,
    UiBadge,
    UiConfirmDialog,
    DatePipe,
    CurrencyPipe,
    ApiImgPipe,
    UiAvatar,
    NgOptimizedImage,
    VentureSkeleton
  ]
})
export class VentureDetails implements OnInit {
  icons = VENTURE_DETAILS_ICONS;
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly slug = this.route.snapshot.params['slug'];
  store = inject(VenturesStore);

  selectedProductGallery = signal<{ product: IProduct; index: number } | null>(null);

  ngOnInit(): void {
    this.store.loadOne(this.slug);
  }

  onTogglePublish(): void {
    const venture = this.store.venture();
    if (!venture) return;
    const action = venture.is_published ? 'dépublier' : 'publier';
    this.confirmationService.confirm({
      header: `Confirmer la ${action}`,
      message: `Êtes-vous sûr de vouloir ${action} "${venture.name}" ?`,
      acceptLabel: action === 'publier' ? 'Publier' : 'Dépublier',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.togglePublish(venture.slug);
      }
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }

  viewProductGallery(product: IProduct): void {
    if (product.gallery && product.gallery.length > 1) {
      this.selectedProductGallery.set({ product, index: 0 });
    }
  }

  nextGalleryImage(): void {
    const current = this.selectedProductGallery();
    if (!current || !current.product.gallery) return;
    const nextIndex = (current.index + 1) % current.product.gallery.length;
    this.selectedProductGallery.set({ ...current, index: nextIndex });
  }

  prevGalleryImage(): void {
    const current = this.selectedProductGallery();
    if (!current || !current.product.gallery) return;
    const prevIndex = (current.index - 1 + current.product.gallery.length) % current.product.gallery.length;
    this.selectedProductGallery.set({ ...current, index: prevIndex });
  }

  closeProductGallery(): void {
    this.selectedProductGallery.set(null);
  }

  updateGalleryIndex(index: number): { product: IProduct; index: number } | null {
    const current = this.selectedProductGallery();
    if (!current) return null;
    return { ...current, index };
  }

  formatExternalUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  }
}
