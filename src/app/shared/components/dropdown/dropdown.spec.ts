import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dropdown } from './dropdown';
import { Product } from '../../../models/product.model';

describe('Dropdown', () => {
  let component: Dropdown;
  let fixture: ComponentFixture<Dropdown>;

  const mockProduct: Product = {
    id: 'test-1',
    name: 'Test Product',
    description: 'Test Description',
    logo: 'http://test.com/logo.png',
    date_release: new Date('2025-01-01'),
    date_revision: new Date('2026-01-01')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dropdown]
    }).compileComponents();

    fixture = TestBed.createComponent(Dropdown);
    component = fixture.componentInstance;
    component.product = mockProduct;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggle', () => {
    it('should toggle isOpen state', () => {
      expect(component.isOpen).toBeFalsy();
      
      component.toggle();
      expect(component.isOpen).toBeTruthy();
      
      component.toggle();
      expect(component.isOpen).toBeFalsy();
    });
  });

  describe('onEdit', () => {
    it('should emit edit event with product', () => {
      const spy = jest.spyOn(component.edit, 'emit');
      component.isOpen = true;
      
      component.onEdit();
      
      expect(spy).toHaveBeenCalledWith(mockProduct);
      expect(component.isOpen).toBeFalsy();
    });
  });

  describe('onDelete', () => {
    it('should emit delete event with product id', () => {
      const spy = jest.spyOn(component.delete, 'emit');
      component.isOpen = true;
      
      component.onDelete();
      
      expect(spy).toHaveBeenCalledWith('test-1');
      expect(component.isOpen).toBeFalsy();
    });
  });

  describe('onClickOutside', () => {
    it('should close dropdown when clicking outside', () => {
      component.isOpen = true;
      
      const event = new MouseEvent('click');
      component.onClickOutside(event);
      
      expect(component.isOpen).toBeFalsy();
    });

    it('should not close dropdown when clicking inside', () => {
      component.isOpen = true;
      
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', {
        value: fixture.nativeElement,
        enumerable: true
      });
      
      jest.spyOn(component['elementRef'].nativeElement, 'contains').mockReturnValue(true);
      component.onClickOutside(event);
      
      expect(component.isOpen).toBeTruthy();
    });
  });
});