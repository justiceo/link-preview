import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContentPopupComponent } from '../content-popup/content-popup.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
import { OptionsPageComponent } from '../options-page/options-page.component';
import { PermissionRequestComponent } from '../permission-request/permission-request.component';
import { VoiceSearchComponent } from '../voice-search/voice-search.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: 'popup',
    component: VoiceSearchComponent,
  },
  {
    path: 'content-popup',
    component: ContentPopupComponent,
  },
  {
    path: 'options',
    component: OptionsPageComponent,
  },
  {
    path: 'request-permissions',
    component: PermissionRequestComponent,
  },
  {
    path: 'onboard',
    component: OnboardingComponent,
  },
  {
    path: '',
    component: AppComponent,
    pathMatch: 'full',
  },
  {
    path: '**',
    component: AppComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
