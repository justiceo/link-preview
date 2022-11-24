import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'primeng/api';
import { FocusTrapModule } from 'primeng/focustrap';
import { RippleModule } from 'primeng/ripple';
import { PreviewComponent } from './preview.component';

@NgModule({
  imports: [CommonModule, FocusTrapModule, RippleModule],
  exports: [PreviewComponent, SharedModule],
  declarations: [PreviewComponent],
})
export class PreviewModule {}
