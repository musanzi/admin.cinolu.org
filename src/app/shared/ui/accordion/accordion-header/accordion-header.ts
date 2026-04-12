import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { UI_ACCORDION_HEADER_ICONS } from '@shared/data';
import { UiAccordionPanel } from '../accordion-panel/accordion-panel';

@Component({
  selector: 'app-ui-accordion-header',
  imports: [LucideAngularModule],
  templateUrl: './accordion-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiAccordionHeader {
  icons = UI_ACCORDION_HEADER_ICONS;
  panel = inject(UiAccordionPanel, { optional: true });
}
