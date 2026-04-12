import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { UI_BUTTON_ICONS } from '@shared/data';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'info' | 'contrast' | 'success' | 'outlined';
type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-ui-button',
  imports: [LucideAngularModule],
  templateUrl: './button.html',

  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiButton {
  icons = UI_BUTTON_ICONS;
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<ButtonVariant>('primary');
  size = input<ButtonSize>('medium');
  outlined = input<boolean>(false);
  text = input<boolean>(false);
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  clicked = output<MouseEvent>();

  handleClick(event: MouseEvent) {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  buttonClasses(): string {
    const baseClasses = 'ui-button w-full';
    const variantClass = `ui-button-${this.variant()}`;
    const sizeClass = `ui-button-${this.size()}`;
    const outlinedClass = this.outlined() ? 'ui-button-outlined' : '';
    const textClass = this.text() ? 'ui-button-text' : '';
    const disabledClass = this.disabled() ? 'ui-button-disabled' : '';
    return [baseClasses, variantClass, sizeClass, outlinedClass, textClass, disabledClass].filter(Boolean).join(' ');
  }

  spinnerSize(): number {
    switch (this.size()) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  }

  sizePadding(): string {
    switch (this.size()) {
      case 'small':
        return '0.5rem 0.875rem';
      case 'large':
        return '0.75rem 1.5rem';
      default:
        return '0.625rem 1.25rem';
    }
  }

  sizeFontSize(): string {
    switch (this.size()) {
      case 'small':
        return '0.875rem';
      case 'large':
        return '1rem';
      default:
        return '0.9375rem';
    }
  }

  sizeMinHeight(): string {
    switch (this.size()) {
      case 'small':
        return '2rem';
      case 'large':
        return '3rem';
      default:
        return '2.5rem';
    }
  }

  sizeLineHeight(): string {
    return '1.5rem';
  }
}
