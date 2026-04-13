import { Component, effect, input, output, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { FilePondComponent, FilePondModule, registerPlugin } from 'ngx-filepond';
import imagePreview from 'filepond-plugin-image-preview';
import { environment } from '@env/environment';
registerPlugin(imagePreview);

@Component({
  selector: 'app-ui-file-upload',
  imports: [FilePondModule],
  templateUrl: './file-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUpload {
  pond = viewChild<FilePondComponent>('pond');
  name = input.required<string>();
  url = input.required<string>();
  method = input<'POST' | 'PATCH'>('POST');
  multiple = input<boolean>(false);
  loaded = output<void>();
  pondOptions: unknown;

  constructor() {
    effect(() => {
      this.pondOptions = {
        name: this.name(),
        acceptedFileTypes: 'image/jpeg, image/png, image/webp',
        maxFileSize: '1MB',
        allowImagePreview: !this.multiple(),
        allowFileSizeValidation: true,
        credits: false,
        instantUpload: this.multiple(),
        allowRemove: true,
        allowMultiple: this.multiple(),
        onprocessfiles: () => {
          this.handleLoaded();
        },
        server: {
          process: {
            url: environment.apiUrl + this.url(),
            method: this.method(),
            withCredentials: true
          }
        }
      };
    });
  }

  handleLoaded(): void {
    this.loaded.emit();
    setTimeout(() => {
      this.pond()?.['pond']?.removeFiles();
    }, 3000);
  }
}
