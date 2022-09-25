import { TestBed } from '@angular/core/testing';

import { InputDeviceService } from './input-device.service';

describe('InputDeviceService', () => {
  let service: InputDeviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputDeviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
