import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
import { BackButton } from '@shared/ui/back-button/back-button';
import { UiAvatar } from '@ui';
import { AuthStore } from '@core/auth';
import { LucideAngularModule } from 'lucide-angular';
import { ADMIN_LAYOUT_ICONS } from '@shared/data';
import { ApiImgPipe } from '../../../shared/pipes/api-img.pipe';
import { MobileMenu } from '../../components/mobile-menu/mobile-menu';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.html',
  host: {
    '(document:click)': 'onDocumentClick($event)'
  },
  imports: [RouterModule, LucideAngularModule, Sidebar, BackButton, UiAvatar, ApiImgPipe, MobileMenu],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayout {
  icons = ADMIN_LAYOUT_ICONS;
  authStore = inject(AuthStore);
  isUserMenuOpen = signal(false);

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((value) => !value);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const isInsideMenu = target.closest('[data-user-menu]');
    const isInsideButton = target.closest('[data-user-menu-button]');
    if (!isInsideMenu && !isInsideButton && this.isUserMenuOpen()) {
      this.closeUserMenu();
    }
  }

  handleSignOut(): void {
    this.authStore.signOut();
  }
}
