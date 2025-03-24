import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokermonListComponent } from './pokemon-list.component';

describe('PokermonListComponent', () => {
  let component: PokermonListComponent;
  let fixture: ComponentFixture<PokermonListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokermonListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokermonListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
