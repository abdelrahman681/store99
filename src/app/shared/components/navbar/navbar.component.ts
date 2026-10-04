import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter } from 'rxjs';

import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectBasketItemsCount } from '../../../store/basket/basket.selectors';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BrandLogoComponent],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  private store = inject(Store);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  user$ = this.store.select(selectCurrentUser);
  basketCount$ = this.store.select(selectBasketItemsCount);

  menuOpen = false;
  userMenuOpen = false;

  constructor() {
    // Close the phone menu / user menu after every navigation
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.closeMenus());
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.userMenuOpen = false;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMenus(): void {
    this.menuOpen = false;
    this.userMenuOpen = false;
  }

  initial(name?: string | null): string {
    return (name ?? '?').trim().charAt(0).toUpperCase() || '?';
  }

  photo(url?: string | null): string | null {
    return url ? url.replace(/\\/g, '/') : null;
  }

  logout(): void {
    this.closeMenus();
    this.store.dispatch(AuthActions.logout());
  }

  // click outside → close the user dropdown / phone menu
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenus();
    } else if (this.userMenuOpen && !(event.target as HTMLElement).closest('.user-menu')) {
      this.userMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenus();
  }
}
