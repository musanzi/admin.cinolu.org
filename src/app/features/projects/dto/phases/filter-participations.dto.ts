import { ParticipationStatus } from '@shared/models';

export interface FilterParticipationsDto {
  page: number | null;
  q: string | null;
  phaseId: string | null;
  status: ParticipationStatus | null;
}
