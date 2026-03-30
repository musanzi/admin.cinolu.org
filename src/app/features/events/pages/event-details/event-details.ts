import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChartColumn, SquarePen, Images, Star, Eye } from 'lucide-angular';
import { UiTabs, UiButton } from '@shared/ui';
import { EventsStore } from '../../store/events.store';
import { EventSheet } from '../../components/event-sheet/event-sheet';
import { EventGalleryComponent } from '../../components/event-gallery/event-gallery';
import { EventUpdate } from '../../components/event-update/event-update';
import { EventDetailsSkeleton } from '../../ui/event-details-skeleton/event-details-skeleton';
import { GalleryStore } from '../../store/event-gallery.store';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EventsStore, GalleryStore],
  imports: [UiTabs, EventSheet, EventGalleryComponent, EventUpdate, EventDetailsSkeleton, LucideAngularModule, UiButton]
})
export class EventDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly slug = this.route.snapshot.params['slug'];
  eventsStore = inject(EventsStore);
  galleryStore = inject(GalleryStore);
  activeTab = signal('details');
  tabs = [
    { label: "Fiche d'activité", name: 'details', icon: ChartColumn },
    { label: 'Mettre à jour', name: 'edit', icon: SquarePen },
    { label: 'Gérer la galerie', name: 'gallery', icon: Images }
  ];

  ngOnInit(): void {
    this.eventsStore.loadOne(this.slug);
    this.galleryStore.loadAll(this.slug);
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  onDeleteImage(imageId: string): void {
    this.galleryStore.delete(imageId);
  }

  onCoverUploaded(): void {
    this.eventsStore.loadOne(this.slug);
  }

  onGalleryUploaded(): void {
    this.galleryStore.loadAll(this.slug);
  }

  onShowcase(): void {
    const event = this.eventsStore.event();
    if (!event) return;
    this.eventsStore.showcase(event.id);
  }

  onPublish(): void {
    const event = this.eventsStore.event();
    if (!event) return;
    this.eventsStore.publish(event.id);
  }

  icons = { Star, Eye };
}
