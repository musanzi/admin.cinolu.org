import { Routes } from '@angular/router';

export const programsRoutes: Routes = [
  {
    path: 'programs',
    title: 'Les programmes',
    children: [
      {
        path: '',
        title: 'Les programmes',
        loadComponent: () => import('./pages/list-programs/list-programs').then((c) => c.ListPrograms)
      },
      {
        path: 'add',
        title: 'Ajouter un programme',
        loadComponent: () => import('./pages/add-program/add-program').then((c) => c.AddProgramPage)
      },
      {
        path: ':slug',
        title: 'Détails du programme',
        loadComponent: () => import('./pages/update-program/update-program').then((c) => c.UpdateProgram)
      }
    ]
  },
  {
    path: 'program-categories',
    title: 'Les categories',
    loadComponent: () => import('./pages/program-categories/program-categories').then((c) => c.ProgramCategories)
  },
  {
    path: 'program-sectors',
    title: 'Les secteurs',
    loadComponent: () => import('./pages/program-sectors/program-sectors').then((c) => c.ProgramSectors)
  }
];
