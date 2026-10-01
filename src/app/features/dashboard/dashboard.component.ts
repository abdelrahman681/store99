import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmService } from '../../core/services/confirm.service';

import { ProductService } from '../../core/services/product.service';
import { BrandService } from '../../core/services/brandservice.service';
import { CategoryService } from '../../core/services/categoryservice.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Brand } from '../../core/models/brand.model';
import { Category } from '../../core/models/category.model';
import { Product } from '../../core/models/product.model';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private fb = inject(FormBuilder);

  private productService = inject(ProductService);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  products: Product[] = [];
 loadingProducts = false;

  // =========================
  // Data
  // =========================

  brands: Brand[] = [];
  categories: Category[] = [];

  selectedImage: File | null = null;


  // =========================
  // UI State
  // =========================

  loading = false;

  loadingBrands = false;
  loadingCategories = false;
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  // Assigning a non-empty message shows a toast (the existing code keeps assigning as before)
  set successMessage(value: string) { if (value) this.toast.success(value); }
  get successMessage(): string { return ''; }
  set errorMessage(value: string) { if (value) this.toast.error(value); }
  get errorMessage(): string { return ''; }
  

  // =========================
  // Form
  // =========================

  form = this.fb.nonNullable.group({

    name: [
      '',
      Validators.required
    ],

    description: [
      '',
      Validators.required
    ],

    price: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    productBrandId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    productCategoryId: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

      stockQuantity: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });


  // =========================
  // Init
  // =========================

  ngOnInit(): void {

    this.loadBrands();

    this.loadCategories();
     this.loadProducts();
  }


  // =========================
  // Load Brands
  // =========================

  loadBrands(): void {

    this.loadingBrands = true;

    this.brandService.getBrands().subscribe({

      next: response => {

        this.brands = response.data;

        this.loadingBrands = false;

      },

      error: error => {

        console.error('Error loading brands:', error);

        this.loadingBrands = false;

        this.errorMessage =
          'حدث خطأ أثناء تحميل الـ Brands';

      }

    });

  }


  // =========================
  // Load Categories
  // =========================

  loadCategories(): void {

    this.loadingCategories = true;

    this.categoryService.getCategories().subscribe({

      next: response => {

        this.categories = response.data;

        this.loadingCategories = false;

      },

      error: error => {

        console.error('Error loading categories:', error);

        this.loadingCategories = false;

        this.errorMessage =
          'حدث خطأ أثناء تحميل الـ Categories';

      }

    });

  }


  // =========================
  // Image
  // =========================

  onImageSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      this.selectedImage = null;

      return;
    }

    this.selectedImage =
      input.files[0];

  }


  // =========================
  // Submit
  // =========================
submit(): void {

  this.successMessage = '';
  this.errorMessage = '';

  // Validate form
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  // Validate image
  if (!this.selectedImage) {
    this.errorMessage = 'من فضلك اختر صورة للمنتج';
    return;
  }

  this.loading = true;

  const product = {
    ...this.form.getRawValue(),
    image: this.selectedImage
  };

  console.log('Product before sending:', product);

  this.productService.createProduct(product).subscribe({

   next: response => {

  this.loading = false;

  this.successMessage = 'تم إضافة المنتج بنجاح';

  this.form.reset({
    name: '',
    description: '',
    price: 0,
    productBrandId: 0,
    productCategoryId: 0,
    stockQuantity: 0
  });

  this.selectedImage = null;

  setTimeout(() => {
    this.successMessage = '';
  }, 1000);
},

error: error => {

  this.loading = false;

  console.error('Create product error:', error);

  this.errorMessage =
    error?.error?.message ||
    'حدث خطأ أثناء إضافة المنتج';

  setTimeout(() => {
    this.errorMessage = '';
  }, 1000);
}

  });
}

async deleteProduct(productId: number): Promise<void> {

  const confirmed = await this.confirmService.ask({
    title: 'حذف المنتج',
    message: 'هل أنت متأكد أنك تريد حذف هذا المنتج؟',
    confirmText: 'حذف',
    tone: 'danger'
  });

  if (!confirmed) {
    return;
  }

  this.productService.deleteProduct(productId).subscribe({
    next: response => {


      this.successMessage = 'تم حذف المنتج بنجاح';

      setTimeout(() => {
        this.successMessage = '';
      }, 1000);

    },

    error: error => {

      console.error('Delete error:', error);

      this.errorMessage =
        error?.error?.message ||
        'حدث خطأ أثناء حذف المنتج';

      setTimeout(() => {
        this.errorMessage = '';
      }, 1000);

    }
  });
}

loadProducts(): void {
  this.loadingProducts = true;

  this.productService.getProducts({
    pageIndex: 1,
    pageSize: 10
  }).subscribe({
    next: response => {
      console.log('Products:', response);

      this.products = response.data;
      this.loadingProducts = false;
    },

    error: error => {
      console.error('Error loading products:', error);

      this.loadingProducts = false;

      this.errorMessage = 'حدث خطأ أثناء تحميل المنتجات';

      setTimeout(() => {
        this.errorMessage = '';
      }, 1000);
    }
  });
}

}