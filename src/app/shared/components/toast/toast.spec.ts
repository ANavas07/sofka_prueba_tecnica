import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Toast } from './toast';
import { ToastService, ToastConfiguration } from '../../../services/toastService';
import { Subject } from 'rxjs';

describe('Toast', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;
  let toastService: ToastService;
  let toastSubject: Subject<ToastConfiguration>;

  beforeEach(async () => {
    toastSubject = new Subject<ToastConfiguration>();
    
    const mockToastService = {
      toast$: toastSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [Toast],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to toast service', () => {
      expect(component.toasts.length).toBe(0);
      
      const toast: ToastConfiguration = {
        id: 1,
        message: 'Test message',
        type: 'success',
        duration: 3000
      };
      
      toastSubject.next(toast);
      
      expect(component.toasts.length).toBe(1);
      expect(component.toasts[0]).toEqual(toast);
    });

    it('should auto-remove toast after duration', fakeAsync(() => {
      const toast: ToastConfiguration = {
        id: 1,
        message: 'Test',
        type: 'info',
        duration: 1000
      };
      
      toastSubject.next(toast);
      expect(component.toasts.length).toBe(1);
      
      tick(1000);
      expect(component.toasts.length).toBe(0);
    }));

    it('should not auto-remove toast if duration is 0', fakeAsync(() => {
      const toast: ToastConfiguration = {
        id: 1,
        message: 'Test',
        type: 'info',
        duration: 0
      };
      
      toastSubject.next(toast);
      expect(component.toasts.length).toBe(1);
      
      tick(5000);
      expect(component.toasts.length).toBe(1);
    }));
  });

  describe('removeToast', () => {
    it('should remove toast by id', () => {
      component.toasts = [
        { id: 1, message: 'Test 1', type: 'success' },
        { id: 2, message: 'Test 2', type: 'error' }
      ];
      
      component.removeToast(1);
      
      expect(component.toasts.length).toBe(1);
      expect(component.toasts[0].id).toBe(2);
    });
  });

  describe('getIcon', () => {
    it('should return correct icon for each type', () => {
      expect(component.getIcon('success')).toBe('✓');
      expect(component.getIcon('error')).toBe('✕');
      expect(component.getIcon('warning')).toBe('⚠');
      expect(component.getIcon('info')).toBe('ℹ');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from toast service', () => {
      const spy = jest.spyOn(component['subscription'], 'unsubscribe');
      component.ngOnDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});