import type { BuildConfig } from '../../model';
export function adapter(b: BuildConfig): string {
    const color = (ok: boolean) => ok ? '#1a8e8a' : '#cbd3d6';
    return `<svg viewBox="0 0 600 120" role="img" aria-label="組み立て中のBinder Linker XB"><circle cx="90" cy="45" r="28" fill="${color(b.binder === 'kanr-binder')}"/><path d="M120 45q45 -40 90 0t90 0t90 0" fill="none" stroke="${color(b.linker === 'ggs')}" stroke-width="9"/><rect x="390" y="18" width="90" height="54" rx="12" fill="${color(b.anchor === 'xb')}"/><text x="60" y="105">Binder</text><text x="230" y="105">GGS Linker</text><text x="390" y="105">XB → ClpX ZBD</text></svg>`;
}
