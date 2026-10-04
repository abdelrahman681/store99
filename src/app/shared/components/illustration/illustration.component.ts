import { Component, Input } from '@angular/core';

export type IllustrationKind = 'cart' | 'heart' | 'box' | 'search' | 'bell' | 'pin';

/** Small "sticker" style illustrations for empty states. Usage: <app-illustration kind="cart" /> */
@Component({
  selector: 'app-illustration',
  standalone: true,
  template: `
    <svg viewBox="0 0 240 180" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-hidden="true">
      <!-- shared backdrop -->
      <path d="M36 98C30 58 66 30 112 32C158 34 206 52 206 98C206 142 160 160 114 160C70 160 41 140 36 98Z" fill="var(--brand-soft)"/>
      <circle cx="198" cy="40" r="13" fill="var(--sun-soft)"/>
      <circle cx="40" cy="146" r="9" fill="var(--teal-soft)"/>
      <circle cx="214" cy="128" r="5" fill="var(--brand)" opacity=".35"/>
      <path d="M26 66l5 0M28.5 63.5l0 5" stroke="var(--teal)" stroke-width="3"/>

      @switch (kind) {
        @case ('cart') {
          <g class="bob">
            <path d="M62 66h12l9 42h58l9-32H78" stroke="var(--ink)" stroke-width="4"/>
            <path d="M78 76h72l-8 30H86Z" fill="#fff" stroke="var(--ink)" stroke-width="4"/>
            <path d="M96 84v14M114 84v14M132 84v14" stroke="var(--brand)" stroke-width="4"/>
            <circle cx="92" cy="124" r="8" fill="var(--ink)"/><circle cx="140" cy="124" r="8" fill="var(--ink)"/>
            <circle cx="92" cy="124" r="3" fill="#fff"/><circle cx="140" cy="124" r="3" fill="#fff"/>
          </g>
        }
        @case ('heart') {
          <g class="bob">
            <path d="M120 130C84 106 74 88 80 72C86 58 108 56 120 74C132 56 154 58 160 72C166 88 156 106 120 130Z" fill="var(--rose-soft)" stroke="var(--ink)" stroke-width="4"/>
            <path d="M96 76c4-6 11-5 14 0" stroke="#fff" stroke-width="4"/>
          </g>
          <path d="M170 90c-6-4-9-8-7-11c2-3 7-2 7 2c0-4 5-5 7-2c2 3-1 7-7 11Z" fill="var(--rose)" class="pop"/>
        }
        @case ('box') {
          <g class="bob">
            <path d="M74 84L120 64L166 84V132L120 152L74 132Z" fill="#fff" stroke="var(--ink)" stroke-width="4"/>
            <path d="M74 84L120 104L166 84M120 104V152" stroke="var(--ink)" stroke-width="4"/>
            <path d="M97 74L143 94V112L97 92Z" fill="var(--sun)" stroke="var(--ink)" stroke-width="3"/>
          </g>
        }
        @case ('search') {
          <g class="bob">
            <circle cx="110" cy="86" r="30" fill="#fff" stroke="var(--ink)" stroke-width="4"/>
            <path d="M133 110L158 136" stroke="var(--ink)" stroke-width="9"/>
            <path d="M100 80c0-8 20-9 20 1c0 8-10 8-10 16" stroke="var(--brand)" stroke-width="4.5"/>
            <circle cx="110" cy="105" r="2.6" fill="var(--brand)"/>
          </g>
        }
        @case ('bell') {
          <g class="swing">
            <path d="M120 54C98 54 90 72 90 92V108L80 122H160L150 108V92C150 72 142 54 120 54Z" fill="var(--sun-soft)" stroke="var(--ink)" stroke-width="4"/>
            <path d="M120 54V46" stroke="var(--ink)" stroke-width="4"/>
            <path d="M108 122C108 130 112 136 120 136C128 136 132 130 132 122" fill="var(--sun)" stroke="var(--ink)" stroke-width="4"/>
          </g>
          <path d="M172 78c6 5 6 15 0 20M180 70c10 9 10 27 0 36" stroke="var(--teal)" stroke-width="3.5"/>
        }
        @case ('pin') {
          <ellipse cx="120" cy="146" rx="34" ry="7" fill="var(--ink)" opacity=".12"/>
          <g class="bob">
            <path d="M120 140C96 112 88 98 88 82C88 64 102 52 120 52C138 52 152 64 152 82C152 98 144 112 120 140Z" fill="var(--brand)" stroke="var(--ink)" stroke-width="4"/>
            <circle cx="120" cy="82" r="12" fill="#fff" stroke="var(--ink)" stroke-width="4"/>
          </g>
        }
      }
    </svg>
  `,
  styles: [`
    :host { display: block; }
    svg { width: 100%; height: auto; display: block; overflow: visible; }
    .bob { animation: bob 3.2s ease-in-out infinite; }
    .swing { transform-origin: 120px 50px; animation: swing 2.6s ease-in-out infinite; }
    .pop { transform-origin: 170px 82px; animation: pop 2.4s ease-in-out infinite; }
    @keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes swing { 0%, 100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
    @keyframes pop { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.25); } }
    @media (prefers-reduced-motion: reduce) { .bob, .swing, .pop { animation: none; } }
  `]
})
export class IllustrationComponent {
  @Input() kind: IllustrationKind = 'box';
}
