import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductsService } from '../../services/products.services';
import { ToastService } from '../../services/toastService';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-register-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.css',
})
export class RegisterForm implements OnInit {
  form!: FormGroup;
  isSubmitting: boolean = false;
  isEditMode: boolean = false;
  productId?: string;

  constructor(
    private fb: FormBuilder,
    private productService: ProductsService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    const navigation = this.router.currentNavigation();
    const product = navigation?.extras?.state?.['product'] as Product | undefined;

    if (!product) {
      const historyState = history.state;
      if (historyState && historyState.product) {
        this.isEditMode = true;
        this.productId = historyState.product.id;
        this.loadProductData(historyState.product);
      }
    } else {
      this.isEditMode = true;
      this.productId = product.id;
      this.loadProductData(product);
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      id: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(10)
      ]],
      name: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100)
      ]],
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200)
      ]],
      logo: ['', [Validators.required]],
      date_release: ['', [
        Validators.required,
        this.dateReleaseDateValidator()
      ]],
      date_revision: ['', [
        Validators.required
      ]]
    });

    const dateRevisionControl = this.form.get('date_revision');
    if (dateRevisionControl) {
      dateRevisionControl.setValidators([
        Validators.required,
        this.dateRevisionDateValidator(this.form.get('date_release')!)
      ]);
    }

    this.form.get('date_release')?.valueChanges.subscribe(() => {
      this.form.get('date_revision')?.updateValueAndValidity();
    });
  }

  private loadProductData(product: Product): void {
    this.form.patchValue({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: this.formatDateForInput(product.date_release),
      date_revision: this.formatDateForInput(product.date_revision)
    });

    if (this.isEditMode) {
      this.form.get('id')?.disable();
    }
  }

  private formatDateForInput(date: Date | string): string {
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  //fecha debe ser >= hoy | 1 año posterior a date_release
  private dateReleaseDateValidator() {
    return (control: AbstractControl) => {
      if (!control.value) return null;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = this.toLocalMidnightDate(control.value);

      return inputDate.getTime() >= today.getTime() ? null : { invalidDate: true };
    };
  }

  private dateRevisionDateValidator(releaseControl: AbstractControl) {
    return (control: AbstractControl) => {
      if (!control.value || !releaseControl.value) return null;
      const releaseDate = this.toLocalMidnightDate(releaseControl.value);
      const revisionDate = this.toLocalMidnightDate(control.value);
      const oneYearLater = new Date(releaseDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      return revisionDate.getTime() >= oneYearLater.getTime() ? null : { invalidDate: true };
    }
  }

  private toLocalMidnightDate(v: string | Date): Date {
    if (v instanceof Date) {
      const d = new Date(v);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
  }


  // Verificar si ID ya existe
  async validateIdNotExists(): Promise<void> {
    if (this.isEditMode) return;

    const idControl = this.form.get('id');
    if (!idControl || idControl.invalid) return;

    const id = idControl.value;

    this.productService.verifyId(id).subscribe({
      next: (exists: any) => {
        if (exists) {
          idControl.setErrors({ idExists: true });
        }
      },
      error: () => {
        this.toastService.error('Error al verificar ID');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.form.getRawValue();

    const request$ = this.isEditMode && this.productId
      ? this.productService.update(this.productId, formData)
      : this.productService.create(formData);

    request$.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente';
        this.toastService.success(message);
        if (!this.isEditMode) {
          setTimeout(() => {
            this.onReset();
          }, 2000);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (err: any) => {
        const action = this.isEditMode ? 'actualizar' : 'crear';
        this.toastService.error(`Error al ${action} producto: ` + err.message);
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onReset(): void {
    this.form.reset();
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return control ? control.invalid && control.touched : false;
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido!';

    if (control.errors['minlength']) {
      const min = control.errors['minlength'].requiredLength;
      if (field === 'id') return 'ID no válido!';
      return `Mínimo ${min} caracteres`;
    }

    if (control.errors['maxlength']) {
      const max = control.errors['maxlength'].requiredLength;
      if (field === 'id') return 'ID no válido!';
      return `Máximo ${max} caracteres`;
    }

    if (control.errors['invalidDate']) {
      if (field === 'date_release') return 'La fecha debe ser igual o mayor a hoy';
      if (field === 'date_revision') return 'La fecha debe ser posterior a un año de la fecha de liberación';
      return 'Fecha no válida';
    }

    if (control.errors['idExists']) return 'Este ID ya existe!';

    return 'Campo no válido';
  }

}
