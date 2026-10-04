import { Component, Input } from '@angular/core';

/** Big illustration for the home hero and the login/register side panel (pure SVG, no image files). */
@Component({
  selector: 'app-hero-art',
  standalone: true,
  template: `
    <div class="art" [style.--art-ink]="tone === 'dark' ? '#f3ece0' : '#1d1a16'">
      <svg viewBox="0 0 480 420" fill="none" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Store99">
        <!-- backdrop -->
        <circle cx="240" cy="214" r="178" [attr.fill]="tone === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.62)'"/>
        <circle class="ring" cx="240" cy="214" r="196" [attr.stroke]="tone === 'dark' ? 'rgba(255,255,255,.28)' : 'rgba(217,72,15,.35)'" stroke-width="2.5" stroke-dasharray="3 11"/>

        <!-- smartwatch -->
        <g class="f2">
          <rect x="356" y="104" width="46" height="150" rx="14" fill="var(--art-ink)"/>
          <rect x="338" y="152" width="82" height="64" rx="20" fill="#fff" stroke="var(--art-ink)" stroke-width="6"/>
          <circle cx="379" cy="184" r="19" fill="var(--teal-soft)"/>
          <path d="M379 184V172M379 184L388 190" stroke="var(--art-ink)" stroke-width="4.5"/>
        </g>

        <!-- headphones -->
        <g class="f1">
          <path d="M62 190C62 138 92 108 134 108C176 108 206 138 206 190" stroke="var(--art-ink)" stroke-width="12"/>
          <rect x="48" y="176" width="36" height="66" rx="16" fill="var(--teal)" stroke="var(--art-ink)" stroke-width="6"/>
          <rect x="184" y="176" width="36" height="66" rx="16" fill="var(--teal)" stroke="var(--art-ink)" stroke-width="6"/>
          <path d="M60 196V222M208 196V222" stroke="#fff" stroke-width="4" opacity=".55"/>
        </g>

        <!-- main bag -->
        <g class="bag">
          <path d="M184 150V128C184 98 208 80 240 80C272 80 296 98 296 128V150" stroke="var(--art-ink)" stroke-width="12"/>
          <path d="M160 150H320L338 332Q340 352 320 352H160Q140 352 142 332Z" fill="var(--brand)" stroke="var(--art-ink)" stroke-width="7"/>
          <path d="M160 150H320L324 190H156Z" fill="rgba(255,255,255,.14)"/>
          <path d="M172 214V322" stroke="#fff" stroke-width="7" opacity=".16"/>
          <g stroke="#fff" stroke-width="15">
            <circle cx="213" cy="262" r="22"/><path d="M235 262C235 303 220 320 192 320"/>
            <circle cx="283" cy="262" r="22"/><path d="M305 262C305 303 290 320 262 320"/>
          </g>
        </g>

        <!-- price tag -->
        <g class="f3">
          <path d="M72 306L128 292L158 336L138 378L86 372L58 340Z" fill="var(--sun)" stroke="var(--art-ink)" stroke-width="6" transform="rotate(-8 108 332)"/>
          <circle cx="88" cy="326" r="6" fill="#fff" stroke="var(--art-ink)" stroke-width="3.5"/>
          <path d="M104 358L128 322" stroke="var(--art-ink)" stroke-width="5"/>
          <circle cx="106" cy="326" r="4" fill="var(--art-ink)"/><circle cx="126" cy="354" r="4" fill="var(--art-ink)"/>
        </g>

        <!-- gift -->
        <g class="f1">
          <rect x="360" y="298" width="76" height="62" rx="10" fill="var(--rose)" stroke="var(--art-ink)" stroke-width="6"/>
          <rect x="352" y="282" width="92" height="26" rx="9" fill="#ff5c7c" stroke="var(--art-ink)" stroke-width="6"/>
          <path d="M398 282V360" stroke="var(--sun)" stroke-width="12"/>
          <path d="M398 282C380 262 362 268 372 280C378 288 396 284 398 282ZM398 282C416 262 434 268 424 280C418 288 400 284 398 282Z" fill="var(--sun)" stroke="var(--art-ink)" stroke-width="4"/>
        </g>

        <!-- sparkles -->
        <path class="tw" d="M118 74l5 14 14 5-14 5-5 14-5-14-14-5 14-5Z" fill="var(--sun)"/>
        <path class="tw d2" d="M392 60l4 11 11 4-11 4-4 11-4-11-11-4 11-4Z" fill="#fff"/>
        <path class="tw d3" d="M230 392l3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--teal)"/>
        <circle cx="440" cy="236" r="6" fill="var(--sun)"/><circle cx="30" cy="268" r="5" fill="var(--rose)"/><circle cx="300" cy="40" r="5" fill="var(--teal)"/>
      </svg>

      @if (chips) {
        <span class="chip c1"><i class="bi bi-shield-lock-fill"></i> دفع آمن</span>
        <span class="chip c2"><i class="bi bi-truck"></i> توصيل سريع</span>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .art { position: relative; }
    svg { width: 100%; height: auto; display: block; overflow: visible; }
    .bag { transform-origin: 240px 352px; animation: sway 5s ease-in-out infinite; }
    .f1 { animation: float 4.2s ease-in-out infinite; }
    .f2 { animation: float 5s ease-in-out -1.2s infinite; }
    .f3 { animation: float 4.6s ease-in-out -2.4s infinite; }
    .ring { transform-origin: 240px 214px; animation: spin 48s linear infinite; }
    .tw { transform-box: fill-box; transform-origin: center; animation: twinkle 2.6s ease-in-out infinite; }
    .d2 { animation-delay: -.9s; } .d3 { animation-delay: -1.7s; }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    @keyframes sway { 0%, 100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes twinkle { 0%, 100% { transform: scale(.7); opacity: .6; } 50% { transform: scale(1.15); opacity: 1; } }

    .chip { position: absolute; display: inline-flex; align-items: center; gap: .45rem; padding: .5rem .9rem; border-radius: 999px; background: #fff; color: var(--art-ink); font-weight: 800; font-size: .85rem; box-shadow: 0 10px 24px rgba(60, 40, 20, .16); animation: float 4.4s ease-in-out infinite; }
    .chip i { color: var(--brand); }
    .c1 { top: 8%; inset-inline-start: 2%; }
    .c2 { bottom: 12%; inset-inline-end: 0; animation-delay: -2s; }
    .c2 i { color: var(--teal); }

    @media (prefers-reduced-motion: reduce) { .bag, .f1, .f2, .f3, .ring, .tw, .chip { animation: none; } }
  `]
})
export class HeroArtComponent {
  @Input() tone: 'light' | 'dark' = 'light';
  @Input() chips = false;
}
