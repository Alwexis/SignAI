import { TestBed } from '@angular/core/testing';

import { HtppService } from './htpp.service';

describe('HtppService', () => {
  let service: HtppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
