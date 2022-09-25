import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsPageComponent } from './options-page.component';

describe('OptionsPageComponent', () => {
  let component: OptionsPageComponent;
  let fixture: ComponentFixture<OptionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptionsPageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
