import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'profilo',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../profilo/profilo.module').then(m => m.ProfiloPageModule)
          }
        ]
      },
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'path',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../path/path.module').then(m => m.PathPageModule)
          }
        ]
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../map/map.module').then(m => m.MapPageModule)
          }
        ]
      },
      {
        path: 'pathId',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pathId/pathId.module').then(m => m.PathIdPageModule)
          }
        ]
      },
      {
        path: 'pois_view',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('../pois_view/pois_view.module').then(m => m.PoisViewPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule { }
