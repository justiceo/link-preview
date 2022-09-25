import { TestBed } from '@angular/core/testing';

import { SearchEngineService } from './search-engine.service';

describe('SearchEngineService', () => {
  let service: SearchEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
