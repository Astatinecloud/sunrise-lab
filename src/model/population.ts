import { params } from './params';
// Division dilutes intracellular contents; killing removes whole cells.
export function divisionRate(totalCells: number): number {
    return Math.min(params.r_g.value, Math.max(params.r_g.value * (1 - totalCells / params.K.value), 0));
}
export function growthRate(totalCells: number, kill: number): number {
    return params.r_g.value * (1 - totalCells / params.K.value) - params.r_kill.value * kill;
}
export function populationDerivative(cells: number, totalCells: number, kill: number): number {
    return growthRate(totalCells, kill) * cells;
}
export function deltaLog10(finalCells: number, initialCells: number): number {
    return Math.log10(finalCells / initialCells);
}
