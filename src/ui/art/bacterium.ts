// Hand-written structural SVG; coordinates describe art, not biology.
export function bacterium(kanr = 12, contracted = false, beat = 0): string {
    return `<svg viewBox="0 0 700 330" role="img" aria-label="大腸菌の膜、KanR、PVCとClpXP">
<rect x="170" y="85" width="490" height="210" rx="105" fill="#e4f2ef" stroke="#1a8e8a" stroke-width="8"/>
<rect x="185" y="100" width="460" height="180" rx="90" fill="#f9fffc" stroke="#7cc6af" stroke-width="4"/>
    ${Array.from({
        length: Math.max(0, Math.min(40, kanr))
    }, (_, i) => `<circle cx="${240 + i % 8 * 45}" cy="${140 + Math.floor(i / 8) * 27}" r="7" fill="#e8a33d"/>`).join('')}
    <g class="pvc beat-${beat}" transform="translate(${beat > 0 ? 110 : 40} 25)">
<path d="M0 10H75V${contracted ? 47 : 75}H0Z" fill="#6c5ce7"/>
<path d="M8 15L65 30 8 45 65 60" fill="none" stroke="white" stroke-width="4"/>
<path d="M36 30V120L25 108M36 120L47 108" fill="none" stroke="#5141aa" stroke-width="7"/>
<path d="M0 80L-15 115M75 80L90 115" stroke="#6c5ce7" stroke-width="5"/>
</g>
    <g transform="translate(${beat >= 3 ? 455 : 300} ${beat >= 2 ? 225 : 48})">
<circle r="14" fill="#e8a33d"/>
<path d="M14 0q12 -18 24 0t24 0" stroke="#1a8e8a" fill="none" stroke-width="5"/>
<rect x="62" y="-12" width="25" height="24" rx="5" fill="#6c5ce7"/>
</g>
    <g transform="translate(565 220)">
<path d="M-30 0l15 -26h30l15 26-15 26h-30z" fill="#1a8e8a"/>
<circle r="9" fill="white"/>
<text y="52" text-anchor="middle">ClpXP</text>
</g>
    <text x="350" y="318">外膜・細胞壁・内膜 / 細胞質</text>
</svg>`;
}
export function bacteriaField(count: number): string {
    return `<svg viewBox="0 0 500 220" class="field" role="img" aria-label="細菌のモデル表示 ${count}個">${Array.from({
        length: count
    }, (_, i) => `<g transform="translate(${18 + (i * 71) % 465} ${16 + (Math.floor(i / 7) * 29) % 185}) rotate(${i * 37 % 150})">
<rect x="-10" y="-5" width="22" height="10" rx="5" fill="#78c6b3" stroke="#1a8e8a"/>
<path d="M-5 -2h12" stroke="#e9fff9"/>
</g>`).join('')}</svg>`;
}
