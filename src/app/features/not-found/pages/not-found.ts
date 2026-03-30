import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, SearchX, House, ArrowLeft } from 'lucide-angular';
import { Location } from '@angular/common';
import { UiButton } from '@ui';

@Component({
  selector: 'app-not-found',
  imports: [LucideAngularModule, RouterModule, UiButton],
  templateUrl: './not-found.html',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPage {
  private readonly location = inject(Location);
  icons = { SearchX, House, ArrowLeft };

  goBack(): void {
    this.location.back();
  }
}
