import { input, inject, computed, Component, ChangeDetectionStrategy } from '@angular/core';
import { UiAccordion } from '../accordion';

@Component({
  selector: 'app-ui-accordion-panel',
  templateUrl: './accordion-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiAccordionPanel {
  value = input.required<string>();
  private readonly accordion = inject(UiAccordion, { optional: true });

  isActive = computed(() => {
    return this.accordion?.isActive(this.value()) ?? false;
  });

  toggle(): void {
    this.accordion?.toggle(this.value());
  }
}
