import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';

import { ProductService } from '../../../core/services/product.service';
import { BrandService } from '../../../core/services/brandservice.service';
import { CategoryService } from '../../../core/services/categoryservice.service';

import { Product } from '../../../core/models/product.model';
import { Brand } from '../../../core/models/brand.model';
import { Category } from '../../../core/models/category.model';

@Component({
selector: 'app-products-management',
standalone: true,
imports: [
CommonModule,
FormsModule,
RouterLink
],
templateUrl: './products-management.component.html',
styleUrl: './products-management.component.css'
})
export class ProductsManagementComponent implements OnInit {

private productService = inject(ProductService);
private brandService = inject(BrandService);
private categoryService = inject(CategoryService);

// =========================
// Products
// =========================

products: Product[] = [];

loadingProducts = false;

currentPage = 1;
pageSize = 10;
totalPages = 0;

// =========================
// Brands & Categories
// =========================

brands: Brand[] = [];
categories: Category[] = [];

loadingBrands = false;
loadingCategories = false;

// =========================
// Messages
// =========================
  private toast = inject(ToastService);
  private confirmService = inject(ConfirmService);

  // Assigning a non-empty message shows a toast (the existing code keeps assigning as before)
  set successMessage(value: string) { if (value) this.toast.success(value); }
  get successMessage(): string { return ''; }
  set errorMessage(value: string) { if (value) this.toast.error(value); }
  get errorMessage(): string { return ''; }

// =========================
// Edit Product
// =========================

editingProduct = false;
savingProduct = false;

selectedProduct: any = {
id: 0,
name: '',
description: '',
price: 0,
productBrandId: 0,
productCategoryId: 0,
stockQuantity: 0,
pictureUrl: ''
};

selectedImage: File | null = null;

// =========================
// Init
// =========================

ngOnInit(): void {


this.loadProducts();

this.loadBrands();

this.loadCategories();


}

// =========================
// Load Brands
// =========================

loadBrands(): void {

this.loadingBrands = true;

this.brandService.getBrands().subscribe({

  next: response => {

    console.log('Brands:', response);

    this.brands = response.data;

    this.loadingBrands = false;

  },

  error: error => {

    console.error(
      'Error loading brands:',
      error
    );

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

    console.log('Categories:', response);

    this.categories = response.data;

    this.loadingCategories = false;

  },

  error: error => {

    console.error(
      'Error loading categories:',
      error
    );

    this.loadingCategories = false;

    this.errorMessage =
      'حدث خطأ أثناء تحميل الـ Categories';

  }

});

}

// =========================
// Load Products
// =========================

loadProducts(): void {

this.loadingProducts = true;

this.productService.getProducts({

  pageIndex: this.currentPage,

  pageSize: this.pageSize

}).subscribe({

  next: response => {

    console.log(
      'Products:',
      response
    );

    this.products =
      response.data;

    this.currentPage =
      response.pageIndex;

    this.pageSize =
      response.pageSize;

    this.totalPages =
      response.totalPages;

    this.loadingProducts = false;

  },

  error: error => {

    console.error(
      'Error loading products:',
      error
    );

    this.loadingProducts = false;

    this.errorMessage =
      'حدث خطأ أثناء تحميل المنتجات';

    setTimeout(() => {

      this.errorMessage = '';

    }, 2000);

  }

});

}

// =========================
// Pagination
// =========================

goToPage(page: number): void {

if (
  page < 1 ||
  page > this.totalPages
) {
  return;
}

this.currentPage = page;

this.loadProducts();

}

// =========================
// Start Edit
// =========================

editProduct(product: Product): void {

this.editingProduct = true;

this.selectedImage = null;

this.productService
  .getProductById(product.id)
  .subscribe({

    next: productDetails => {

      console.log(
        'Product details:',
        productDetails
      );

      this.selectedProduct = {

        id:
          productDetails.id,

        name:
          productDetails.name,

        description:
          productDetails.description,

        price:
          productDetails.price,

        productBrandId:
          (productDetails as any)
            .productBrandId ?? 0,

        productCategoryId:
          (productDetails as any)
            .productCategoryId ?? 0,

        stockQuantity:
          productDetails.stockQuantity,

        pictureUrl:
          productDetails.pictureUrl

      };


      window.scrollTo({

        top: 0,

        behavior: 'smooth'

      });

    },

    error: error => {

      console.error(
        'Error loading product:',
        error
      );

      this.editingProduct = false;

      this.errorMessage =
        'حدث خطأ أثناء تحميل بيانات المنتج';

      setTimeout(() => {

        this.errorMessage = '';

      }, 2000);

    }

  });

}

// =========================
// Select Image
// =========================

onImageSelected(event: Event): void {

const input =
  event.target as HTMLInputElement;

if (
  input.files &&
  input.files.length > 0
) {

  this.selectedImage =
    input.files[0];

}

}

// =========================
// Update Product
// =========================

updateProduct(): void {

  this.savingProduct = true;

  this.productService
    .editProduct({

      id: this.selectedProduct.id,

      name: this.selectedProduct.name,

      description: this.selectedProduct.description,

      price: this.selectedProduct.price,

      productBrandId: this.selectedProduct.productBrandId,

      productCategoryId: this.selectedProduct.productCategoryId,

      stockQuantity: this.selectedProduct.stockQuantity,

      pictureUrl: this.selectedProduct.pictureUrl,

      image: this.selectedImage

    })
    .subscribe({

      next: response => {

        console.log(
          'Edit response:',
          response
        );

        this.savingProduct = false;

        this.successMessage =
          'تم تعديل المنتج بنجاح';

        this.editingProduct = false;

        this.selectedImage = null;

        this.loadProducts();

        setTimeout(() => {

          this.successMessage = '';

        }, 2000);

      },

      error: error => {

        console.error(
          'Edit error:',
          error
        );

        this.savingProduct = false;

        this.errorMessage =
          error?.error?.message ||
          'حدث خطأ أثناء تعديل المنتج';

        setTimeout(() => {

          this.errorMessage = '';

        }, 2000);

      }

    });

}
// =========================
// Cancel Edit
// =========================

cancelEdit(): void {

this.editingProduct = false;

this.selectedImage = null;

this.selectedProduct = {

  id: 0,

  name: '',

  description: '',

  price: 0,

  productBrandId: 0,

  productCategoryId: 0,

  stockQuantity: 0,

  pictureUrl: ''

};

}

// =========================
// Delete Product
// =========================

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


this.productService
  .deleteProduct(productId)
  .subscribe({

    next: response => {


      this.products =
        this.products.filter(

          product =>
            product.id !== productId

        );


      this.successMessage =
        'تم حذف المنتج بنجاح';


      setTimeout(() => {

        this.successMessage = '';

      }, 1000);

    },

    error: error => {

      console.error(
        'Delete error:',
        error
      );

      this.errorMessage =
        error?.error?.message ||
        'حدث خطأ أثناء حذف المنتج';


      setTimeout(() => {

        this.errorMessage = '';

      }, 1000);

    }

  });


}

}
