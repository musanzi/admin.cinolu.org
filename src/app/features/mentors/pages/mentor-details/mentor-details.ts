import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MentorsStore } from '../../store/mentors.store';
import {
  LucideAngularModule,
  CircleCheckBig,
  CircleX,
  Briefcase,
  Calendar,
  Award,
  FileText,
  ExternalLink
} from 'lucide-angular';
import { UiBadge, UiConfirmDialog } from '@shared/ui';
import { ConfirmationService } from '@shared/services/confirmation';
import { DatePipe } from '@angular/common';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { UiAvatar } from '@shared/ui';
import { environment } from '@env/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MentorsStore, ConfirmationService],
  imports: [LucideAngularModule, UiBadge, UiConfirmDialog, DatePipe, ApiImgPipe, UiAvatar, RouterLink]
})
export class MentorDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly id = this.route.snapshot.params['id'];
  store = inject(MentorsStore);
  cvUrl = environment.apiUrl + 'uploads/mentors/cvs/';
  icons = { CircleCheckBig, CircleX, Briefcase, Calendar, Award, FileText, ExternalLink };

  ngOnInit(): void {
    this.store.loadOne(this.id);
  }

  onApprove(): void {
    this.confirmationService.confirm({
      header: "Confirmer l'approbation",
      message: 'Êtes-vous sûr de vouloir approuver ce profil mentor ?',
      acceptLabel: 'Approuver',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.approve(this.id);
      }
    });
  }

  onReject(): void {
    this.confirmationService.confirm({
      header: 'Confirmer le rejet',
      message: 'Êtes-vous sûr de vouloir rejeter ce profil mentor ?',
      acceptLabel: 'Rejeter',
      rejectLabel: 'Annuler',
      accept: () => {
        this.store.reject(this.id);
      }
    });
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  }

  getStatusVariant(status: string): 'warning' | 'success' | 'danger' {
    if (status === 'pending') return 'warning';
    if (status === 'approved') return 'success';
    return 'danger';
  }

  getStatusLabel(status: string): string {
    if (status === 'pending') return 'En attente';
    if (status === 'approved') return 'Approuvé';
    return 'Rejeté';
  }
}
