import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslatableStringFormComponent } from './translatable-string-form.component';

describe('TranslatableStringFormComponent', () => {
  let component: TranslatableStringFormComponent;
  let fixture: ComponentFixture<TranslatableStringFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslatableStringFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslatableStringFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
