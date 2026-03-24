import { ParticipationStatus } from '@shared/models';

export interface ReviewParticipationDto {
  status: ParticipationStatus;
  review_message?: string;
}
