import { NgOptimizedImage } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { IEvent, IImage } from '@shared/models';
import { LucideAngularModule } from 'lucide-angular';
import { EVENT_GALLERY_COMPONENT_ICONS } from '@shared/data';
import { FileUpload } from '@shared/ui';
import { ApiImgPipe } from '@shared/pipes';

@Component({
  selector: 'app-event-gallery',
  templateUrl: './event-gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, LucideAngularModule, FileUpload, ApiImgPipe]
})
export class EventGalleryComponent {
  icons = EVENT_GALLERY_COMPONENT_ICONS;
  event = input.required<IEvent>();
  gallery = input.required<IImage[]>();
  isLoading = input<boolean>(false);
  coverUploaded = output<void>();
  galleryUploaded = output<void>();
  deleteImage = output<string>();

  onCoverUploaded(): void {
    this.coverUploaded.emit();
  }

  onGalleryUploaded(): void {
    this.galleryUploaded.emit();
  }

  onDeleteImage(imageId: string): void {
    this.deleteImage.emit(imageId);
  }
}
