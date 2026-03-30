import {
  Component,
  input,
  output,
  forwardRef,
  computed,
  signal,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
  effect
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ChevronDown, LucideAngularModule, Plus } from 'lucide-angular';

export interface SelectOption {
  label: string;
  value: unknown;
  disabled?: boolean;
}

@Component({
  selector: 'app-ui-select',
  imports: [LucideAngularModule],
  templateUrl: './select.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelect), multi: true }]
})
export class UiSelect implements ControlValueAccessor {
  label = input<string>('');
  options = input<SelectOption[] | unknown[]>([]);
  placeholder = input<string>('');
  disabled = input<boolean>(false);
  id = input<string>('');
  invalid = input<boolean>(false);
  filter = input<boolean>(false);
  filterPlaceholder = input<string>('Rechercher...');
  required = input<boolean>(false);
  optionLabel = input<string>('');
  optionValue = input<string>('');
  allowCreate = input<boolean>(false);
  createPlaceholder = input<string>('Ajouter une option');
  createButtonLabel = input<string>('Ajouter');
  createDisabled = input<boolean>(false);
  modelValue = input<unknown | undefined>(undefined);
  createOption = output<string>();
  valueChange = output<unknown>();
  searchTermChange = output<string>();
  icons = { ChevronDown, Plus };
  value = signal<unknown>('');
  isOpen = signal(false);
  createValue = signal('');
  filterTerm = signal('');
  isControlDisabled = signal(false);
  private readonly elementRef = inject(ElementRef);
  constructor() {
    effect(() => {
      const modelValue = this.modelValue();
      if (modelValue !== undefined) {
        this.value.set(modelValue ?? '');
      }
    });
    effect(() => {
      if (this.isDisabled()) {
        this.isOpen.set(false);
      }
    });
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

  selectedOption = computed(() => {
    return this.normalizedOptions().find((opt) => String(opt.value) === String(this.value()));
  });
  filteredOptions = computed(() => {
    const options = this.normalizedOptions();
    if (!this.filter()) {
      return options;
    }

    const term = this.filterTerm().trim().toLowerCase();
    if (!term) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(term));
  });

  displayText = computed(() => {
    const selected = this.selectedOption();
    return selected ? selected.label : '';
  });
  canCreate = computed(() => this.createValue().trim().length > 0 && !this.createDisabled());
  isDisabled = computed(() => this.disabled() || this.isControlDisabled());

  private onChangeCallback: (value: unknown) => void = () => undefined;
  onTouched: () => void = () => undefined;

  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) {
      return;
    }
    const target = event.target as HTMLElement;
    const element = this.elementRef.nativeElement;
    if (!element.contains(target)) {
      this.isOpen.set(false);
      this.filterTerm.set('');
      this.searchTermChange.emit('');
    }
  }

  writeValue(value: unknown): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
  }

  toggleDropdown(): void {
    if (!this.isDisabled()) {
      this.isOpen.set(!this.isOpen());
      if (this.isOpen()) {
        this.onTouched();
      } else {
        this.filterTerm.set('');
        this.searchTermChange.emit('');
      }
    }
  }

  selectOption(option: SelectOption): void {
    if (option.disabled) {
      return;
    }
    this.value.set(option.value);
    this.onChangeCallback(this.value());
    this.valueChange.emit(this.value());
    this.isOpen.set(false);
    this.filterTerm.set('');
    this.searchTermChange.emit('');
    this.onTouched();
  }

  selectClasses(): string {
    const baseClasses = 'ui-select';
    const invalidClass = this.invalid() ? 'ui-select-invalid' : '';
    const disabledClass = this.isDisabled() ? 'ui-select-disabled' : '';
    return [baseClasses, invalidClass, disabledClass].filter(Boolean).join(' ');
  }

  isSelected(optionValue: unknown): boolean {
    return String(this.value()) === String(optionValue);
  }

  onCreateInput(event: Event): void {
    if (this.isDisabled()) return;
    const target = event.target as HTMLInputElement;
    this.createValue.set(target.value);
  }

  onFilterInput(event: Event): void {
    if (this.isDisabled()) return;
    const target = event.target as HTMLInputElement;
    const nextTerm = target.value ?? '';
    this.filterTerm.set(nextTerm);
    this.searchTermChange.emit(nextTerm);
  }

  onFilterKeydown(event: KeyboardEvent): void {
    event.stopPropagation();
  }

  onCreateKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.stopPropagation();
    this.onCreateOption();
  }

  onCreateOption(): void {
    if (!this.canCreate() || this.isDisabled()) return;
    this.createOption.emit(this.createValue().trim());
    this.createValue.set('');
  }
}
