import {
  Component,
  input,
  output,
  forwardRef,
  signal,
  computed,
  effect,
  ElementRef,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChevronDown, LucideAngularModule, Plus } from 'lucide-angular';
import { SelectOption } from '../select/select';
import { UiCheckbox } from '../checkbox/checkbox';

@Component({
  selector: 'app-ui-multi-select',
  imports: [FormsModule, LucideAngularModule, UiCheckbox],
  templateUrl: './multi-select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiMultiSelect), multi: true }]
})
export class UiMultiSelect implements ControlValueAccessor {
  label = input<string>('');
  options = input<SelectOption[] | unknown[]>([]);
  placeholder = input<string>('Select items');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  id = input<string>('');
  invalid = input<boolean>(false);
  display = input<'comma' | 'chip'>('comma');
  optionLabel = input<string>('');
  optionValue = input<string>('');
  allowCreate = input<boolean>(false);
  createPlaceholder = input<string>('Ajouter une option');
  createButtonLabel = input<string>('Ajouter');
  createDisabled = input<boolean>(false);
  createOption = output<string>();
  icons = { ChevronDown, Plus };

  value = signal<unknown[]>([]);
  isOpen = signal(false);
  createValue = signal('');
  checkboxValues: Record<string, boolean> = {};
  private readonly elementRef = inject(ElementRef);

  constructor() {
    effect(() => {
      this.normalizedOptions();
      this.updateCheckboxValues();
    });
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }
    const target = event.target as HTMLElement;
    const element = this.elementRef.nativeElement;
    if (!element.contains(target)) {
      this.isOpen.set(false);
    }
  }

  normalizedOptions = computed(() => {
    const opts = this.options();
    const labelKey = this.optionLabel();
    const valueKey = this.optionValue();
    if (labelKey && valueKey) {
      return (opts as Record<string, unknown>[]).map((opt) => ({
        label: String(opt[labelKey] ?? ''),
        value: opt[valueKey],
        disabled: false
      }));
    }

    return opts as SelectOption[];
  });

  selectedLabels = computed(() => {
    const selectedOptions = this.normalizedOptions().filter((opt) =>
      this.value().some((v) => String(v) === String(opt.value))
    );
    return selectedOptions.map((opt) => opt.label);
  });

  displayText = computed(() => {
    const labels = this.selectedLabels();
    if (labels.length === 0) {
      return '';
    }
    if (labels.length === 1) {
      return labels[0];
    }
    const firstLabel = labels[0];
    const othersCount = labels.length - 1;
    return `${firstLabel} et ${othersCount}`;
  });
  canCreate = computed(() => this.createValue().trim().length > 0 && !this.createDisabled());

  onChange!: (value: unknown[]) => void;
  onTouched!: () => void;

  writeValue(value: unknown[]): void {
    this.value.set(value || []);
    this.updateCheckboxValues();
  }

  updateCheckboxValues(): void {
    this.checkboxValues = {};
    this.normalizedOptions().forEach((opt) => {
      this.checkboxValues[this.getCheckboxId(opt.value)] = this.isSelected(opt.value);
    });
  }

  registerOnChange(fn: (value: unknown[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {
    void _isDisabled;
  }

  toggleDropdown(): void {
    if (!this.disabled()) {
      this.isOpen.set(!this.isOpen());
    }
  }

  isSelected(optionValue: unknown): boolean {
    return this.value().some((v) => String(v) === String(optionValue));
  }

  toggleOption(optionValue: unknown): void {
    if (this.isSelected(optionValue)) {
      this.value.update((current) => current.filter((v) => String(v) !== String(optionValue)));
    } else {
      this.value.update((current) => [...current, optionValue]);
    }
    this.updateCheckboxValues();
    this.onChange(this.value());
    this.onTouched();
  }

  removeItem(optionValue: unknown, event: Event): void {
    event.stopPropagation();
    this.value.update((current) => current.filter((v) => String(v) !== String(optionValue)));
    this.updateCheckboxValues();
    this.onChange(this.value());
    this.onTouched();
  }

  selectClasses() {
    const baseClasses = 'ui-select';
    const invalidClass = this.invalid() ? 'ui-select-invalid' : '';
    const disabledClass = this.disabled() ? 'ui-select-disabled' : '';
    return [baseClasses, invalidClass, disabledClass].filter(Boolean).join(' ');
  }

  getCheckboxId(optionValue: unknown): string {
    return `${this.id()}-option-${String(optionValue)}`;
  }

  onCheckboxChange(optionValue: unknown, checked: boolean): void {
    if (checked) {
      if (!this.isSelected(optionValue)) {
        this.value.update((current) => [...current, optionValue]);
      }
    } else {
      this.value.update((current) => current.filter((v) => String(v) !== String(optionValue)));
    }
    this.updateCheckboxValues();
    this.onChange(this.value());
    this.onTouched();
  }

  onCreateInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.createValue.set(target.value);
  }

  onCreateKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    this.onCreateOption();
  }

  onCreateOption(): void {
    if (!this.canCreate()) return;
    this.createOption.emit(this.createValue().trim());
    this.createValue.set('');
  }
}
