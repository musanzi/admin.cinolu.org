import { NgOptimizedImage } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { IProject, IImage } from '@shared/models';
import { LucideAngularModule } from 'lucide-angular';
import { PROJECT_GALLERY_ICONS } from '@shared/data';
import { FileUpload } from '@shared/ui';
import { ApiImgPipe } from '@shared/pipes';

@Component({
  selector: 'app-project-gallery',
  templateUrl: './project-gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage, LucideAngularModule, FileUpload, ApiImgPipe]
})
export class ProjectGallery {
  icons = PROJECT_GALLERY_ICONS;
  project = input.required<IProject>();
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
