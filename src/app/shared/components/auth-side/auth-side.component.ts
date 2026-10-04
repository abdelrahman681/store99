import { Component, Input } from '@angular/core';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';
import { HeroArtComponent } from '../hero-art/hero-art.component';

/** Decorative left panel of the login / register pages (desktop only). */
@Component({
  selector: 'app-auth-side',
  standalone: true,
  imports: [BrandLogoComponent, HeroArtComponent],
  styles: [':host { display: contents; }'],
  template: `
    <aside class="auth-side">
      <div class="auth-side__brand">
        <span class="brand-mark"><app-brand-logo /></span>
        <span>Store<b>99</b></span>
      </div>

      <div>
        <h2>{{ title }} <em>{{ highlight }}</em></h2>
        <p>{{ text }}</p>
        <ul class="auth-side__list">
          <li><i class="bi bi-bag-check"></i> تابع طلباتك أول بأول</li>
          <li><i class="bi bi-heart"></i> احفظ المنتجات اللي بتحبها</li>
          <li><i class="bi bi-lightning-charge"></i> إتمام الشراء في خطوات بسيطة</li>
        </ul>
      </div>

      <div class="auth-side__art"><app-hero-art tone="dark" /></div>
    </aside>
  `
})
export class AuthSideComponent {
  @Input() title = 'أهلاً بيك في';
  @Input() highlight = 'Store99';
  @Input() text = 'سجّل دخولك وكمّل تسوّقك بسهولة.';
}
