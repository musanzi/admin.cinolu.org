import { Component, inject, signal, afterNextRender, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { UiInput, UiPassword, UiButton } from '@ui';
import { SignInStore } from '../store/sign-in.store';
import { AuthStore } from '@core/auth/auth.store';
import { environment } from '@env/environment';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SignInStore],
  imports: [ReactiveFormsModule, NgOptimizedImage, UiInput, UiPassword, UiButton]
})
export class SignIn {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  form: FormGroup;
  store = inject(SignInStore);
  authStore = inject(AuthStore);
  isCheckingAuth = signal(true);

  constructor() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    afterNextRender(() => {
      this.isCheckingAuth.set(this.authStore.isCheckingAuth());
    });
  }

  onSignIn(): void {
    if (this.form.invalid) return;
    const redirectPath = this.route.snapshot.queryParamMap.get('redirect');
    this.store.signIn({
      payload: this.form.value,
      redirectPath: redirectPath || '/dashboard',
      onSuccess: () => true
    });
  }

  signinWithGoogle(): void {
    window.location.replace(environment.apiUrl + 'auth/google');
  }
}
