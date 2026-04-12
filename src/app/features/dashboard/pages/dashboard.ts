import { Component, ChangeDetectionStrategy, inject, signal, computed, effect, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { DASHBOARD_ICONS } from '@shared/data';
import { UiSelect } from '@ui';
import type { SelectOption } from '@shared/ui';
import { StatsStore } from '../store/stats.store';
import { IProgramParticipations } from '../types';
import { StatsOverview, YearSummary, ProgramTabs, ProgramDetails } from '../components';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  imports: [
    RouterModule,
    FormsModule,
    LucideAngularModule,
    UiSelect,
    StatsOverview,
    YearSummary,
    ProgramTabs,
    ProgramDetails
  ],
  providers: [StatsStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard implements OnInit {
  icons = DASHBOARD_ICONS;
  store = inject(StatsStore);
  currentYear = new Date().getFullYear();
  selectedYear = signal(this.currentYear);
  selectedProgram = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.store.loadByYear(this.selectedYear());
    });

    // Auto-select program with most participants when data changes
    effect(() => {
      const data = this.store.byYear();
      if ((data?.detailedParticipations?.programs?.length || 0) > 0) {
        const programs = data?.detailedParticipations.programs;
        const maxProgram = programs?.reduce((prev, current) =>
          current.participations > prev.participations ? current : prev
        );
        this.selectedProgram.set(maxProgram?.id || null);
      }
    });
  }

  ngOnInit(): void {
    this.store.loadGeneral();
  }

  yearSelectOptions = computed<SelectOption[]>(() =>
    [2024, 2025, 2026, 2027].map((y) => ({ label: String(y), value: y }))
  );

  selectProgram(programId: string): void {
    this.selectedProgram.set(this.selectedProgram() === programId ? null : programId);
  }

  getSelectedProgram(programs: IProgramParticipations[]): IProgramParticipations | null {
    const programId = this.selectedProgram();
    return programId ? (programs.find((p) => p.id === programId) ?? null) : null;
  }
}
