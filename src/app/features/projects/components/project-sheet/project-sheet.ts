import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { IProject } from '@shared/models';
import { LucideAngularModule } from 'lucide-angular';
import { PROJECT_SHEET_ICONS } from '@shared/data';
import { UiAccordion, UiAccordionPanel, UiAccordionHeader, UiAccordionContent } from '@shared/ui';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-sheet',
  templateUrl: './project-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiAccordion, DatePipe, UiAccordionPanel, UiAccordionHeader, UiAccordionContent, LucideAngularModule]
})
export class ProjectSheet {
  icons = PROJECT_SHEET_ICONS;
  project = input.required<IProject>();
}
