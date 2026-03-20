export class ObjectPool<T> {
  private available: T[] = [];
  private active: Set<T> = new Set();
  private readonly factory: () => T;
  private readonly reset: (obj: T) => void;

  constructor(factory: () => T, resetFn: (obj: T) => void, initialSize: number = 100) {
    this.factory = factory;
    this.reset = resetFn;
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  acquire(): T | null {
    let obj = this.available.pop();
    if (!obj) {
      obj = this.factory();
    }
    this.active.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (this.active.delete(obj)) {
      this.reset(obj);
      this.available.push(obj);
    }
  }

  releaseAll(): void {
    for (const obj of this.active) {
      this.reset(obj);
      this.available.push(obj);
    }
    this.active.clear();
  }

  get activeCount(): number {
    return this.active.size;
  }

  get availableCount(): number {
    return this.available.length;
  }

  get totalCount(): number {
    return this.active.size + this.available.length;
  }
}
