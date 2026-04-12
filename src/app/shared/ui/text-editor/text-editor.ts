import {
  Component,
  input,
  forwardRef,
  signal,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  computed
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { UI_TEXT_EDITOR_ICONS } from '@shared/data';

@Component({
  selector: 'app-ui-text-editor',
  imports: [LucideAngularModule],
  templateUrl: './text-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiTextEditor), multi: true }]
})
export class UiTextEditor implements ControlValueAccessor, AfterViewInit {
  icons = UI_TEXT_EDITOR_ICONS;
  @ViewChild('editor', { static: false }) editorElement!: ElementRef<HTMLDivElement>;

  placeholder = input<string>('Start typing...');
  disabled = input<boolean>(false);
  id = input<string>('');
  invalid = input<boolean>(false);
  minHeight = input<string>('300px');
  value = signal('');
  isFocused = signal(false);
  isControlDisabled = signal(false);
  isDisabled = computed(() => this.disabled() || this.isControlDisabled());

  onChange!: (value: string) => void;
  onTouched!: () => void;

  constructor() {
    effect(() => {
      if (this.editorElement) {
        this.editorElement.nativeElement.contentEditable = (!this.isDisabled()).toString();
      }
    });

    effect(() => {
      const currentValue = this.value();
      if (this.editorElement && currentValue !== undefined) {
        const editorContent = this.editorElement.nativeElement.innerHTML;
        if (editorContent !== currentValue) {
          this.editorElement.nativeElement.innerHTML = currentValue || '';
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.editorElement && this.value()) {
      this.editorElement.nativeElement.innerHTML = this.value();
    }
  }

  writeValue(value: string): void {
    this.value.set(value || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isControlDisabled.set(isDisabled);
  }

  onInput(): void {
    if (this.editorElement && !this.isDisabled()) {
      const newValue = this.editorElement.nativeElement.innerHTML;
      this.value.set(newValue);
      this.onChange(newValue);
    }
  }

  onFocus(): void {
    if (this.isDisabled()) return;
    this.isFocused.set(true);
  }

  onBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  execCommand(command: string, value: string | undefined = undefined): void {
    if (this.isDisabled()) return;
    document.execCommand(command, false, value);
    this.editorElement?.nativeElement.focus();
    this.onInput();
  }

  formatBold(): void {
    this.execCommand('bold');
  }

  formatItalic(): void {
    this.execCommand('italic');
  }

  formatUnderline(): void {
    this.execCommand('underline');
  }

  insertBulletList(): void {
    this.execCommand('insertUnorderedList');
  }

  insertOrderedList(): void {
    this.execCommand('insertOrderedList');
  }

  alignLeft(): void {
    this.execCommand('justifyLeft');
  }

  alignCenter(): void {
    this.execCommand('justifyCenter');
  }

  alignRight(): void {
    this.execCommand('justifyRight');
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      this.execCommand('createLink', url);
    }
  }

  insertImage(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      this.execCommand('insertImage', url);
    }
  }

  formatCode(): void {
    this.execCommand('formatBlock', 'pre');
  }

  wrapperClasses(): string {
    const baseClasses = 'ui-text-editor';
    const disabledClass = this.isDisabled() ? 'ui-text-editor-shell-disabled' : '';
    const invalidClass = this.invalid() ? 'ui-text-editor-shell-invalid' : '';
    return [baseClasses, disabledClass, invalidClass].filter(Boolean).join(' ');
  }

  editorClasses(): string {
    const baseClasses = 'ui-text-editor-content';
    const focusedClass = this.isFocused() ? 'ui-text-editor-focused' : '';
    const invalidClass = this.invalid() ? 'ui-text-editor-invalid' : '';
    const disabledClass = this.isDisabled() ? 'ui-text-editor-disabled' : '';
    return [baseClasses, focusedClass, invalidClass, disabledClass].filter(Boolean).join(' ');
  }

  toolbarClasses(): string {
    const baseClasses = 'ui-text-editor-toolbar';
    const disabledClass = this.isDisabled() ? 'ui-text-editor-toolbar-disabled' : '';
    return [baseClasses, disabledClass].filter(Boolean).join(' ');
  }

  buttonClasses(isActive = false): string {
    const baseClasses = 'ui-text-editor-button';
    const activeClass = isActive ? 'ui-text-editor-button-active' : '';
    const disabledClass = this.isDisabled() ? 'ui-text-editor-button-disabled' : '';
    return [baseClasses, activeClass, disabledClass].filter(Boolean).join(' ');
  }
}
