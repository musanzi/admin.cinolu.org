import { IBase } from './base.model';
import type { IPhase } from './phase.model';
import type { IProject } from './project.model';

export enum ResourceCategory {
  GUIDE = 'guide',
  TEMPLATE = 'template',
  LEGAL = 'legal',
  PITCH = 'pitch',
  FINANCIAL = 'financial',
  REPORT = 'report',
  OTHER = 'other'
}

export interface IResource extends IBase {
  title: string;
  description: string;
  file: string;
  category: ResourceCategory;
  project: IProject | null;
  phase: IPhase | null;
}
