import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-ui-textarea',
  templateUrl: './textarea.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiTextarea), multi: true }]
})
export class UiTextarea implements ControlValueAccessor {
  readonly #cdr = inject(ChangeDetectorRef);
  label = input<string>('');
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  id = input<string>('');
  rows = input<number>(4);
  invalid = input<boolean>(false);
  required = input<boolean>(false);
  value = '';
  isControlDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.isControlDisabled());

  onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    this.value = value || '';
    this.#cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
    this.#cdr.markForCheck();
  }

  onInput(event: Event): void {
    if (this.isDisabled()) return;
    const target = event.target as HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  textareaClasses() {
    const baseClasses = 'ui-textarea';
    const invalidClass = this.invalid() ? 'ui-textarea-invalid' : '';
    const disabledClass = this.isDisabled() ? 'ui-textarea-disabled' : '';
    return [baseClasses, invalidClass, disabledClass].filter(Boolean).join(' ');
  }
}
