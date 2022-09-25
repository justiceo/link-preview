import { TestBed } from '@angular/core/testing';

import { RecognitionService } from './recognition.service';

describe('RecognitionService', () => {
  let service: RecognitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecognitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
