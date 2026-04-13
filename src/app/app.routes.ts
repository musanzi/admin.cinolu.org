import { authGuard, unauthGuard } from '@core/guards';
import { Layout } from './layout/layout';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Connexion',
    canActivate: [unauthGuard],
    loadChildren: () => import('@features/sign-in/sign-in.routes').then((m) => m.signInRoutes)
  },
  {
    path: 'dashboard',
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    loadChildren: () => import('@features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Les programmes',
    loadChildren: () => import('@features/programs/programs.routes').then((m) => m.programsRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: 'blog',
    title: 'Blog',
    loadChildren: () => import('@features/blog/blog.routes').then((m) => m.blogRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Projets',
    loadChildren: () => import('@features/projects/projects.routes').then((m) => m.projectsRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Événements',
    loadChildren: () => import('@features/events/events.routes').then((m) => m.eventsRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Opportunités',
    loadChildren: () => import('@features/opportunities/opportunities.routes').then((m) => m.opportunitiesRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Utilisateurs',
    loadChildren: () => import('@features/users/users.routes').then((m) => m.usersRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Mentors',
    loadChildren: () => import('@features/mentors/mentors.routes').then((m) => m.mentorsRoutes)
  },
  {
    component: Layout,
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    path: '',
    title: 'Ventures',
    loadChildren: () => import('@features/ventures/ventures.routes').then((m) => m.venturesRoutes)
  },
  {
    component: Layout,
    path: 'account',
    title: 'Mon compte',
    data: { layout: 'admin-layout' },
    canActivate: [authGuard],
    loadChildren: () => import('@features/account/account.routes').then((m) => m.accountRoutes)
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadChildren: () => import('@features/not-found/not-found.routes').then((m) => m.notFoundRoutes)
  }
];
