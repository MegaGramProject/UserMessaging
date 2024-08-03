import { Routes } from '@angular/router';
import { NotFoundComponent } from '../components/notFoundComponent.component';
import { App2 } from './app2.component';

export const routes: Routes = [
    {path: 'directMessaging/:username', component: App2},
    {path: 'directMessaging', component: App2},
    {path: '**', component: NotFoundComponent}
];