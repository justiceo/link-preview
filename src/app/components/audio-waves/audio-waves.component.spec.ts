import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioWavesComponent } from './audio-waves.component';

describe('AudioWavesComponent', () => {
  let component: AudioWavesComponent;
  let fixture: ComponentFixture<AudioWavesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioWavesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioWavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
