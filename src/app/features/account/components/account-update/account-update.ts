import { Component, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthStore } from '@core/auth';
import { UpdateInfoStore } from '@features/account/store/update-info.store';
import { UpdatePasswordStore } from '@features/account/store/update-password.store';
import { GENDERS } from '@shared/data';
import { parseDate } from '@shared/helpers';
import { IUser } from '@shared/models';
import { UiInput, UiDatepicker, UiTextarea, UiSelect, UiButton, FileUpload } from '@ui';

@Component({
  selector: 'app-account-update',
  templateUrl: './account-update.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [UpdateInfoStore, UpdatePasswordStore],
  imports: [ReactiveFormsModule, UiInput, UiDatepicker, UiTextarea, UiSelect, UiButton, FileUpload]
})
export class AccountUpdate implements OnInit {
  private readonly fb = inject(FormBuilder);
  infoStore = inject(UpdateInfoStore);
  passwordStore = inject(UpdatePasswordStore);
  authStore = inject(AuthStore);
  genderOptions = GENDERS;
  infoForm: FormGroup = this.initInfoForm();
  passwordForm: FormGroup = this.initPasswordForm();
  user = computed<IUser | null>(() => this.authStore.user());

  ngOnInit(): void {
    this.infoForm.patchValue({
      ...this.user(),
      birth_date: parseDate(this.user()?.birth_date)
    });
  }

  private initInfoForm(): FormGroup {
    return this.fb.group({
      email: ['', Validators.email],
      city: ['', Validators.required],
      country: ['', Validators.required],
      biography: [''],
      gender: ['', Validators.required],
      birth_date: ['', Validators.required],
      phone_number: ['', [Validators.minLength(10)]],
      name: ['', Validators.minLength(3)]
    });
  }

  private initPasswordForm(): FormGroup {
    return this.fb.group({
      password: ['', [Validators.minLength(6), Validators.required]],
      password_confirm: ['', [Validators.minLength(6), Validators.required]]
    });
  }

  onLoaded(): void {
    this.authStore.getProfile();
  }

  onUpdateInfo(): void {
    if (!this.infoForm.valid) return;
    this.infoStore.updateInfo(this.infoForm.value);
  }

  onUpdatePassword(): void {
    if (!this.passwordForm.valid) return;
    this.passwordStore.updatePassword(this.passwordForm.value);
  }
}
