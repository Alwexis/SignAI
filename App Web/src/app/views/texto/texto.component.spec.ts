import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextoComponent } from './texto.component';

describe('TextoComponent', () => {
  let component: TextoComponent;
  let fixture: ComponentFixture<TextoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TextoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
