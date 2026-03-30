import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { X, CircleAlert, LucideAngularModule } from 'lucide-angular';
import { UiButton } from '../form/button/button';
import { ConfirmationService } from '@shared/services/confirmation';

@Component({
  selector: 'app-ui-confirm-dialog',
  imports: [UiButton, LucideAngularModule],
  templateUrl: './confirm-dialog.html',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiConfirmDialog {
  private readonly confirmationService = inject(ConfirmationService);
  icons = { X, CircleAlert };
  confirmation = this.confirmationService.getConfirmation;

  onAccept(): void {
    const config = this.confirmation();
    if (config?.accept) {
      config.accept();
    }
    this.confirmationService.close();
  }

  onReject(): void {
    const config = this.confirmation();
    if (config?.reject) {
      config.reject();
    }
    this.confirmationService.close();
  }
}
