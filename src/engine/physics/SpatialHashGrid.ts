export class SpatialHashGrid {
  private readonly grid: Map<string, Set<number>> = new Map();
  private readonly entityCells: Map<number, string[]> = new Map();
  private readonly cellSize: number;

  constructor(cellSize: number = 64) {
    this.cellSize = cellSize;
  }

  private hashKey(cx: number, cy: number): string {
    return `${cx}_${cy}`;
  }

  private getCellCoords(x: number, y: number): [number, number] {
    return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize)];
  }

  insert(entityId: number, x: number, y: number, radius: number = 0): void {
    this.remove(entityId);

    const [minCX, minCY] = this.getCellCoords(x - radius, y - radius);
    const [maxCX, maxCY] = this.getCellCoords(x + radius, y + radius);

    const cells: string[] = [];

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const key = this.hashKey(cx, cy);
        let cell = this.grid.get(key);
        if (!cell) {
          cell = new Set();
          this.grid.set(key, cell);
        }
        cell.add(entityId);
        cells.push(key);
      }
    }

    this.entityCells.set(entityId, cells);
  }

  remove(entityId: number): void {
    const cells = this.entityCells.get(entityId);
    if (cells) {
      for (const key of cells) {
        const cell = this.grid.get(key);
        if (cell) {
          cell.delete(entityId);
          if (cell.size === 0) {
            this.grid.delete(key);
          }
        }
      }
      this.entityCells.delete(entityId);
    }
  }

  getNearby(x: number, y: number, radius: number = 0): number[] {
    const [minCX, minCY] = this.getCellCoords(x - radius, y - radius);
    const [maxCX, maxCY] = this.getCellCoords(x + radius, y + radius);

    const result = new Set<number>();

    for (let cx = minCX; cx <= maxCX; cx++) {
      for (let cy = minCY; cy <= maxCY; cy++) {
        const cell = this.grid.get(this.hashKey(cx, cy));
        if (cell) {
          for (const id of cell) {
            result.add(id);
          }
        }
      }
    }

    return Array.from(result);
  }

  clear(): void {
    this.grid.clear();
    this.entityCells.clear();
  }

  get entityCount(): number {
    return this.entityCells.size;
  }

  get cellCount(): number {
    return this.grid.size;
  }
}
