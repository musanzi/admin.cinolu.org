import { IBase } from './base.model';
import { IEvent } from './event.model';
import { IPhase } from './phase.model';
import { IProject as IProject } from './project.model';
import { IUser as IUser } from './user.model';
import { IVenture as IVenture } from './venture.model';

export type ParticipationStatus = 'pending' | 'in_review' | 'qualified' | 'disqualified' | 'info_requested';

export interface IParticipationReviewer {
  id: string;
  name: string;
  email: string;
}

export interface IProjectParticipationUpvote extends IBase {
  user: IUser;
  participation: IProjectParticipation;
}

export interface IProjectParticipation extends IBase {
  status?: ParticipationStatus;
  review_message?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: IParticipationReviewer | null;
  user: IUser;
  project: IProject;
  venture: IVenture | null;
  phases: IPhase[];
  upvotes?: IProjectParticipationUpvote[];
  upvotesCount?: number;
  isUpvoted?: boolean;
}

export interface IEventParticipation extends IBase {
  user: IUser;
  event: IEvent;
}
