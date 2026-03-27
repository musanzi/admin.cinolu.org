import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { IProject } from '@shared/models';
import { ParticipationsStore } from '@features/projects/store/participations.store';
import { ProjectParticipationDetails } from './project-participation-details/project-participation-details';
import { ProjectParticipationsList } from './project-participations-list/project-participations-list';

@Component({
  selector: 'app-project-participations',
  templateUrl: './project-participations.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ParticipationsStore],
  imports: [ProjectParticipationsList, ProjectParticipationDetails]
})
export class ProjectParticipations {
  project = input.required<IProject>();
  selectedParticipationId = signal<string | null>(null);

  onSelectParticipation(id: string): void {
    this.selectedParticipationId.set(id);
  }

  closeDetails(): void {
    this.selectedParticipationId.set(null);
  }
}
