import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Product } from '../../../models/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
})
export class Dropdown {
  @Input() product!: Product;
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<string>();

  isOpen: boolean = false;

  constructor(private elementRef: ElementRef) { }

  openDropdownId: string | null = null;

  toggle(): void {
    this.isOpen = !this.isOpen;
  }

  onEdit(): void {
    this.edit.emit(this.product);
    this.isOpen = false;
  }

  onDelete(): void {
    this.delete.emit(this.product.id);
    this.isOpen = false;
  }


  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

}
