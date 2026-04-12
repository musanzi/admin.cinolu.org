import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { IEvent } from '@shared/models';
import { LucideAngularModule } from 'lucide-angular';
import { EVENT_SHEET_ICONS } from '@shared/data';
const { BookOpen, Calendar, Clock, FileText, Flag, FolderOpen, MapPin, SquareCheckBig, Target, User, CircleCheckBig } =
  EVENT_SHEET_ICONS;
import { UiAccordion, UiAccordionPanel, UiAccordionHeader, UiAccordionContent } from '@shared/ui';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-sheet',
  templateUrl: './event-sheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UiAccordion, DatePipe, UiAccordionPanel, UiAccordionHeader, UiAccordionContent, LucideAngularModule]
})
export class EventSheet {
  event = input.required<IEvent>();
  icons = {
    FolderOpen,
    User,
    Clock,
    Calendar,
    Flag,
    FileText,
    BookOpen,
    Target,
    SquareCheckBig,
    MapPin,
    CircleCheckBig
  };
}
