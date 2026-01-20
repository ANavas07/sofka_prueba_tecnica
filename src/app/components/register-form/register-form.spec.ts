import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterForm } from './register-form';
import { ProductsService } from '../../services/products.services';
import { ToastService } from '../../services/toastService';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

describe('RegisterForm', () => {
  let component: RegisterForm;
  let fixture: ComponentFixture<RegisterForm>;
  let productServiceSpy: jest.Mocked<ProductsService>;
  let toastServiceSpy: jest.Mocked<ToastService>;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(async () => {
    productServiceSpy = {
      create: jest.fn(),
      update: jest.fn(),
      verifyId: jest.fn(),
      getProducts: jest.fn()
    } as any;

    toastServiceSpy = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn()
    } as any;

    routerSpy = {
      navigate: jest.fn(),
      currentNavigation: jest.fn().mockReturnValue(null)
    } as any;

    await TestBed.configureTestingModule({
      imports: [RegisterForm, ReactiveFormsModule],
      providers: [
        { provide: ProductsService, useValue: productServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: Router, useValue: routerSpy },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values', () => {
      expect(component.form).toBeDefined();
      expect(component.form.get('id')?.value).toBe('');
      expect(component.form.get('name')?.value).toBe('');
    });

    it('should have required validators', () => {
      const idControl = component.form.get('id');
      expect(idControl?.hasError('required')).toBeTruthy();
    });

    it('should initialize with isEditMode false', () => {
      expect(component.isEditMode).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate ID length (min 3, max 10)', () => {
      const idControl = component.form.get('id');

      idControl?.setValue('ab');
      idControl?.markAsTouched();
      expect(idControl?.hasError('minlength')).toBeTruthy();

      idControl?.setValue('12345678901');
      expect(idControl?.hasError('maxlength')).toBeTruthy();

      idControl?.setValue('abc123');
      expect(idControl?.valid).toBeTruthy();
    });

    it('should validate name length (min 5, max 100)', () => {
      const nameControl = component.form.get('name');

      nameControl?.setValue('abc');
      expect(nameControl?.hasError('minlength')).toBeTruthy();

      nameControl?.setValue('Valid Name');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should validate description length (min 10, max 200)', () => {
      const descControl = component.form.get('description');

      descControl?.setValue('short');
      expect(descControl?.hasError('minlength')).toBeTruthy();

      descControl?.setValue('This is a valid description');
      expect(descControl?.valid).toBeTruthy();
    });

    it('should validate logo is required', () => {
      const logoControl = component.form.get('logo');
      expect(logoControl?.hasError('required')).toBeTruthy();

      logoControl?.setValue('http://test.com/logo.png');
      expect(logoControl?.valid).toBeTruthy();
    });

    it('should validate date_release is today or future', () => {
      const dateControl = component.form.get('date_release');

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      dateControl?.setValue(yesterdayStr);
      expect(dateControl?.hasError('invalidDate')).toBeTruthy();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      dateControl?.setValue(tomorrowStr);
      expect(dateControl?.valid).toBeTruthy();
    });

    it('should validate date_revision is 1 year after date_release', () => {
      const releaseControl = component.form.get('date_release');
      const revisionControl = component.form.get('date_revision');

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      releaseControl?.setValue(todayStr);

      const sixMonths = new Date(today);
      sixMonths.setMonth(sixMonths.getMonth() + 6);
      revisionControl?.setValue(sixMonths.toISOString().split('T')[0]);
      expect(revisionControl?.hasError('invalidDate')).toBeTruthy();

      const oneYear = new Date(today);
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      revisionControl?.setValue(oneYear.toISOString().split('T')[0]);
      expect(revisionControl?.valid).toBeTruthy();
    });

    it('should update date_revision validity when date_release changes', fakeAsync(() => {
      const releaseControl = component.form.get('date_release');
      const revisionControl = component.form.get('date_revision');

      const today = new Date();
      releaseControl?.setValue(today.toISOString().split('T')[0]);

      const oneYear = new Date(today);
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      revisionControl?.setValue(oneYear.toISOString().split('T')[0]);

      tick();
      expect(revisionControl?.valid).toBeTruthy();
    }));
  });

  describe('ID Verification', () => {
    it('should verify ID does not exist', fakeAsync(() => {
      productServiceSpy.verifyId.mockReturnValue(of(false));

      component.form.get('id')?.setValue('test123');
      component.validateIdNotExists();
      tick();

      expect(productServiceSpy.verifyId).toHaveBeenCalledWith('test123');
      expect(component.form.get('id')?.hasError('idExists')).toBeFalsy();
    }));

    it('should set error if ID exists', fakeAsync(() => {
      productServiceSpy.verifyId.mockReturnValue(of(true));

      component.form.get('id')?.setValue('existing');
      component.validateIdNotExists();
      tick();

      expect(component.form.get('id')?.hasError('idExists')).toBeTruthy();
    }));

    it('should handle verification error', fakeAsync(() => {
      productServiceSpy.verifyId.mockReturnValue(throwError(() => new Error('Network error')));

      component.form.get('id')?.setValue('test123');
      component.validateIdNotExists();
      tick();

      expect(toastServiceSpy.error).toHaveBeenCalledWith('Error al verificar ID');
    }));

    it('should not verify in edit mode', fakeAsync(() => {
      component.isEditMode = true;
      component.form.get('id')?.setValue('test123');
      component.validateIdNotExists();
      tick();

      expect(productServiceSpy.verifyId).not.toHaveBeenCalled();
    }));

    it('should not verify if ID control is invalid', fakeAsync(() => {
      component.form.get('id')?.setValue('ab'); // Too short
      component.validateIdNotExists();
      tick();

      expect(productServiceSpy.verifyId).not.toHaveBeenCalled();
    }));
  });

  describe('Form Submission', () => {
    beforeEach(() => {
      const today = new Date();
      const oneYear = new Date(today);
      oneYear.setFullYear(oneYear.getFullYear() + 1);

      component.form.patchValue({
        id: 'test123',
        name: 'Test Product',
        description: 'Test Description Here',
        logo: 'http://test.com/logo.png',
        date_release: today.toISOString().split('T')[0],
        date_revision: oneYear.toISOString().split('T')[0]
      });
    });

    it('should create product successfully', fakeAsync(() => {
      productServiceSpy.create.mockReturnValue(of({ message: 'Created', data: {} as any }));

      component.onSubmit();
      tick();

      expect(productServiceSpy.create).toHaveBeenCalled();
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Producto creado exitosamente');
    }));

    it('should reset form after successful creation', fakeAsync(() => {
      productServiceSpy.create.mockReturnValue(of({ message: 'Created', data: {} as any }));

      component.onSubmit();
      tick(2500);

      expect(component.form.get('id')?.value).toBeNull();
    }));

    it('should update product successfully', fakeAsync(() => {
      component.isEditMode = true;
      component.productId = 'test123';
      productServiceSpy.update.mockReturnValue(of({ message: 'Updated', data: {} as any }));

      component.onSubmit();
      tick();

      expect(productServiceSpy.update).toHaveBeenCalledWith('test123', expect.any(Object));
      expect(toastServiceSpy.success).toHaveBeenCalledWith('Producto actualizado exitosamente');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/products']);
    }));

    it('should not submit if form is invalid', () => {
      component.form.patchValue({ id: 'ab' }); // Invalid
      component.onSubmit();

      expect(productServiceSpy.create).not.toHaveBeenCalled();
      expect(component.form.touched).toBeTruthy();
    });

    it('should handle creation error', fakeAsync(() => {
      productServiceSpy.create.mockReturnValue(throwError(() => new Error('Server error')));

      component.onSubmit();
      tick();

      expect(toastServiceSpy.error).toHaveBeenCalled();
      expect(component.isSubmitting).toBeFalsy();
    }));

    it('should handle update error', fakeAsync(() => {
      component.isEditMode = true;
      component.productId = 'test123';
      productServiceSpy.update.mockReturnValue(throwError(() => new Error('Server error')));

      component.onSubmit();
      tick();

      expect(toastServiceSpy.error).toHaveBeenCalled();
      expect(component.isSubmitting).toBeFalsy();
    }));

    it('should set isSubmitting during submission', () => {
      productServiceSpy.create.mockReturnValue(of({ message: 'Created', data: {} as any }));

      expect(component.isSubmitting).toBeFalsy();
      component.onSubmit();
      expect(component.isSubmitting).toBeTruthy();
    });
  });

  describe('Form Reset', () => {
    it('should reset form', () => {
      component.form.patchValue({ id: 'test', name: 'test' });
      component.onReset();

      expect(component.form.get('id')?.value).toBeNull();
      expect(component.form.get('name')?.value).toBeNull();
    });
  });

  describe('Error Messages', () => {
    it('should return required error message', () => {
      const control = component.form.get('id');
      control?.markAsTouched();
      control?.setValue('');

      expect(component.getError('id')).toBe('Este campo es requerido!');
    });

    it('should return minlength error for ID', () => {
      const control = component.form.get('id');
      control?.setValue('ab');

      expect(component.getError('id')).toBe('ID no válido!');
    });

    it('should return maxlength error for ID', () => {
      const control = component.form.get('id');
      control?.setValue('12345678901');

      expect(component.getError('id')).toBe('ID no válido!');
    });

    it('should return minlength error for other fields', () => {
      const control = component.form.get('name');
      control?.setValue('ab');

      expect(component.getError('name')).toContain('Mínimo');
    });

    it('should return maxlength error for other fields', () => {
      const control = component.form.get('name');
      control?.setValue('a'.repeat(101));

      expect(component.getError('name')).toContain('Máximo');
    });

    it('should return idExists error', () => {
      const control = component.form.get('id');
      control?.setErrors({ idExists: true });

      expect(component.getError('id')).toBe('Este ID ya existe!');
    });

    it('should return invalidDate error for date_release', () => {
      const control = component.form.get('date_release');
      control?.setErrors({ invalidDate: true });

      expect(component.getError('date_release')).toBe('La fecha debe ser igual o mayor a hoy');
    });

    it('should return invalidDate error for date_revision', () => {
      const control = component.form.get('date_revision');
      control?.setErrors({ invalidDate: true });

      expect(component.getError('date_revision')).toBe('La fecha debe ser posterior a un año de la fecha de liberación');
    });

    it('should return generic error for unknown errors', () => {
      const control = component.form.get('id');
      control?.setErrors({ unknown: true });

      expect(component.getError('id')).toBe('Campo no válido');
    });

    it('should return empty string if no errors', () => {
      const control = component.form.get('id');
      control?.setValue('valid123');

      expect(component.getError('id')).toBe('');
    });
  });

  describe('isInvalid helper', () => {
    it('should return true if field is invalid and touched', () => {
      const control = component.form.get('id');
      control?.markAsTouched();
      control?.setValue('');

      expect(component.isInvalid('id')).toBeTruthy();
    });

    it('should return false if field is valid', () => {
      const control = component.form.get('id');
      control?.setValue('valid123');

      expect(component.isInvalid('id')).toBeFalsy();
    });

    it('should return false if field is not touched', () => {
      const control = component.form.get('id');
      control?.setValue('');

      expect(component.isInvalid('id')).toBeFalsy();
    });

    it('should return false if control does not exist', () => {
      expect(component.isInvalid('nonexistent')).toBeFalsy();
    });
  });
});