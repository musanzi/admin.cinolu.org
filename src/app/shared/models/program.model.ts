import type { IBase } from './base.model';
import type { ICategory } from './category.model';
import type { IProject } from './project.model';
import type { IEvent } from './event.model';
import type { ISector } from './sector.model';

export interface ISubprogram extends IBase {
  name: string;
  description: string;
  slug: string;
  logo: string;
  is_published: boolean;
  is_highlighted: boolean;
  program: Program;
  projects: IProject[];
  events: IEvent[];
}

export interface Program extends IBase {
  name: string;
  description: string;
  slug: string;
  logo: string;
  is_published: boolean;
  is_highlighted: boolean;
  subprograms: ISubprogram[];
  category: ICategory;
  sector: ISector | null;
}
