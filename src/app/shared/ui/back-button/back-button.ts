import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-ui-back-button',
  imports: [LucideAngularModule],
  templateUrl: './back-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BackButton {
  icons = { ArrowLeft };
  private readonly location = inject(Location);

  onGoBack(): void {
    this.location.back();
  }
}
