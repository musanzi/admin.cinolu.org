import { Component, input, forwardRef, signal, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UI_PASSWORD_ICONS } from '@shared/data';

@Component({
  selector: 'app-ui-password',
  imports: [LucideAngularModule],
  templateUrl: './password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiPassword), multi: true }]
})
export class UiPassword implements ControlValueAccessor {
  icons = UI_PASSWORD_ICONS;
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  id = input<string>('');
  invalid = input<boolean>(false);
  required = input<boolean>(false);
  autocomplete = input<string>('current-password');
  value = '';
  label = input<string>('');
  isMasked = signal<boolean>(true);

  onChange!: (value: string) => void;
  onTouched!: () => void;

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    void isDisabled;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  toggleMask(): void {
    this.isMasked.update((masked) => !masked);
  }

  inputClasses(): string {
    const baseClasses = 'ui-input ui-password';
    const invalidClass = this.invalid() ? 'ui-input-invalid' : '';
    const disabledClass = this.disabled() ? 'ui-input-disabled' : '';
    return [baseClasses, invalidClass, disabledClass].filter(Boolean).join(' ');
  }
}
