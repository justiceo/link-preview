import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IFramerComponent } from './iframer.component';

describe('IFramerComponent', () => {
  let component: IFramerComponent;
  let fixture: ComponentFixture<IFramerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IFramerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IFramerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
