import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputPlateComponent } from './input-plate.component';

describe('InputPlateComponent', () => {
  let component: InputPlateComponent;
  let fixture: ComponentFixture<InputPlateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputPlateComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputPlateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
