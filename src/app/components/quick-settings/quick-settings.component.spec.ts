import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickSettingsComponent } from './quick-settings.component';

describe('QuickSettingsComponent', () => {
  let component: QuickSettingsComponent;
  let fixture: ComponentFixture<QuickSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickSettingsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
