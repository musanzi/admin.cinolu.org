import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  SquarePen,
  Images,
  ChartColumn,
  Star,
  Eye,
  Layers,
  Users,
  Bell,
  FolderKanban,
  LucideAngularModule
} from 'lucide-angular';
import { UiTabs, UiButton } from '@shared/ui';
import { GalleryStore } from '../../store/project-gallery.store';
import { ProjectsStore } from '../../store/projects.store';
import { ProjectDetailsSkeleton } from '../../ui/project-details-skeleton/project-details-skeleton';
import { SubprogramsStore } from '@features/programs/store/subprograms.store';
import { CategoriesStore } from '@features/projects/store/project-categories.store';
import { UsersStore } from '@features/users/store/users.store';
import { ProjectGallery } from '@features/projects/components/project-gallery/project-gallery';
import { ProjectNotifications } from '@features/projects/components/project-notifications/project-notifications';
import { ProjectParticipations } from '@features/projects/components/project-participations/project-participations';
import { Phases } from '@features/projects/components/project-phases/phases';
import { ProjectResources } from '@features/projects/components/project-resources/project-resources';
import { ProjectSheet } from '@features/projects/components/project-sheet/project-sheet';
import { ProjectUpdate } from '@features/projects/components/project-update/project-update';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GalleryStore, ProjectsStore, CategoriesStore, SubprogramsStore, UsersStore],
  imports: [
    UiTabs,
    ProjectSheet,
    ProjectParticipations,
    ProjectGallery,
    ProjectUpdate,
    Phases,
    ProjectNotifications,
    ProjectResources,
    ProjectDetailsSkeleton,
    LucideAngularModule,
    UiButton
  ]
})
export class ProjectDetails implements OnInit {
  #route = inject(ActivatedRoute);
  #slug = this.#route.snapshot.params['slug'];
  projectStore = inject(ProjectsStore);
  galleryStore = inject(GalleryStore);
  categoriesStore = inject(CategoriesStore);
  programsStore = inject(SubprogramsStore);
  usersStore = inject(UsersStore);
  activeTab = signal(this.#route.snapshot.queryParamMap.get('tab') || 'details');
  tabs = [
    { label: "Fiche d'activité", name: 'details', icon: ChartColumn },
    { label: 'Participations', name: 'participations', icon: Users },
    { label: 'Phases', name: 'phases', icon: Layers },
    { label: 'Ressources', name: 'resources', icon: FolderKanban },
    { label: 'Notifications', name: 'notifications', icon: Bell },
    { label: 'Mettre à jour', name: 'edit', icon: SquarePen },
    { label: 'Galerie', name: 'gallery', icon: Images }
  ];

  ngOnInit(): void {
    this.projectStore.loadOne(this.#slug);
    this.galleryStore.loadAll(this.#slug);
    this.categoriesStore.loadUnpaginated();
    this.programsStore.loadUnpaginated();
    this.usersStore.loadStaff();
  }

  onCoverUploaded(): void {
    this.projectStore.loadOne(this.#slug);
  }

  onGalleryUploaded(): void {
    this.galleryStore.loadAll(this.#slug);
  }

  onDeleteImage(id: string): void {
    this.galleryStore.delete(id);
  }

  onTabChange(tab: string): void {
    this.activeTab.set(tab);
  }

  onShowcase(): void {
    const project = this.projectStore.project();
    if (!project) return;
    this.projectStore.showcase(project.id);
  }

  onPublish(): void {
    const project = this.projectStore.project();
    if (!project) return;
    this.projectStore.publish(project.id);
  }

  icons = { Star, Eye, Users };
}
