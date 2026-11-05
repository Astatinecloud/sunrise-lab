export function rk4Step(y: readonly number[], t: number, h: number, f: (t: number, y: readonly number[]) => number[]): number[] {
    const a = f(t, y), b = f(t + h / 2, y.map((v, i) => v + h * a[i] / 2)), c = f(t + h / 2, y.map((v, i) => v + h * b[i] / 2)), d = f(t + h, y.map((v, i) => v + h * c[i]));
    return y.map((v, i) => v + h * (a[i] + 2 * b[i] + 2 * c[i] + d[i]) / 6);
}
