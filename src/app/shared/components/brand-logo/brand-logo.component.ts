import { Component } from '@angular/core';

/** The Store99 mark: a bag drawn in the current text colour with two orange 9s inside. */
@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `
    <svg viewBox="0 0 120 120" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M27 45H93L98 99Q98.6 107 90.5 107H29.5Q21.4 107 22 99Z" stroke="currentColor" stroke-width="7"/>
      <path d="M44 45V37A16 16 0 0 1 76 37V45" stroke="currentColor" stroke-width="7"/>
      <g stroke="#ff6a1a" stroke-width="7">
        <circle cx="48" cy="70" r="7.5"/><path d="M55.5 70C55.5 83 51 89 42.5 89"/>
        <circle cx="73" cy="70" r="7.5"/><path d="M80.5 70C80.5 83 76 89 67.5 89"/>
      </g>
    </svg>
  `,
  styles: [`:host { display: inline-flex; } svg { width: 100%; height: 100%; }`]
})
export class BrandLogoComponent {}
