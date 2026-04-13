import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { OPPORTUNITY_DETAILS_ICONS } from '@shared/data';
import { IOpportunity } from '@shared/models';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { UiBadge } from '@shared/ui';

@Component({
  selector: 'app-opportunity-sheet',
  templateUrl: './opportunity-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, LucideAngularModule, ApiImgPipe, UiBadge]
})
export class OpportunitySheet {
  opportunity = input.required<IOpportunity>();
  icons = OPPORTUNITY_DETAILS_ICONS;
}
