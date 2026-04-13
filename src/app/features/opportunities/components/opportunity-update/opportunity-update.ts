import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { markAllAsTouched, parseDate } from '@shared/helpers';
import { OpportunityLanguage, type IOpportunity } from '@shared/models';
import { SelectOption, UiButton, UiDatepicker, UiInput, UiSelect, UiTextarea } from '@shared/ui';
import { OpportunitiesStore } from '../../store/opportunities.store';

@Component({
  selector: 'app-opportunity-update',
  templateUrl: './opportunity-update.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, UiButton, UiDatepicker, UiInput, UiSelect, UiTextarea]
})
export class OpportunityUpdate implements OnInit {
  opportunity = input.required<IOpportunity>();
  private readonly fb = inject(FormBuilder);
  store = inject(OpportunitiesStore);
  languageOptions: SelectOption[] = [
    { label: 'Français', value: 'fr' satisfies OpportunityLanguage },
    { label: 'English', value: 'en' satisfies OpportunityLanguage }
  ];
  form: FormGroup = this.fb.group({
    id: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', Validators.required],
    due_date: [null as Date | null, Validators.required],
    link: ['', Validators.required],
    language: ['fr' as OpportunityLanguage, Validators.required]
  });

  ngOnInit(): void {
    const opportunity = this.opportunity();
    this.form.patchValue({
      ...opportunity,
      due_date: parseDate(opportunity.due_date)
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      markAllAsTouched(this.form);
      return;
    }

    const value = this.form.getRawValue();
    this.store.update({
      id: String(value.id),
      title: String(value.title),
      description: String(value.description),
      due_date: this.toApiDate(value.due_date),
      link: String(value.link),
      language: value.language as OpportunityLanguage
    });
  }

  private toApiDate(value: unknown): string {
    const date = value instanceof Date ? value : new Date(String(value));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
