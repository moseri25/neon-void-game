import { ComponentType, type ComponentData } from './components';

export type EntityId = number;

export interface System {
  readonly priority: number;
  readonly name: string;
  update(world: World, dt: number): void;
}

export class World {
  private nextEntityId: EntityId = 1;
  private entities: Set<EntityId> = new Set();
  private components: Map<ComponentType, Map<EntityId, ComponentData[ComponentType]>> = new Map();
  private systems: System[] = [];
  private entitiesToDestroy: EntityId[] = [];

  constructor() {
    for (const type of Object.values(ComponentType)) {
      this.components.set(type as ComponentType, new Map());
    }
  }

  createEntity(): EntityId {
    const id = this.nextEntityId++;
    this.entities.add(id);
    return id;
  }

  destroyEntity(entityId: EntityId): void {
    this.entitiesToDestroy.push(entityId);
  }

  private processDestroyQueue(): void {
    for (const id of this.entitiesToDestroy) {
      this.entities.delete(id);
      for (const store of this.components.values()) {
        store.delete(id);
      }
    }
    this.entitiesToDestroy.length = 0;
  }

  addComponent<T extends ComponentType>(
    entityId: EntityId,
    type: T,
    data: ComponentData[T]
  ): void {
    const store = this.components.get(type);
    if (store) {
      store.set(entityId, data);
    }
  }

  removeComponent(entityId: EntityId, type: ComponentType): void {
    this.components.get(type)?.delete(entityId);
  }

  getComponent<T extends ComponentType>(
    entityId: EntityId,
    type: T
  ): ComponentData[T] | undefined {
    return this.components.get(type)?.get(entityId) as ComponentData[T] | undefined;
  }

  hasComponent(entityId: EntityId, type: ComponentType): boolean {
    return this.components.get(type)?.has(entityId) ?? false;
  }

  query(...types: ComponentType[]): EntityId[] {
    const result: EntityId[] = [];
    for (const entityId of this.entities) {
      let hasAll = true;
      for (const type of types) {
        if (!this.components.get(type)?.has(entityId)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        result.push(entityId);
      }
    }
    return result;
  }

  addSystem(system: System): void {
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  removeSystem(name: string): void {
    this.systems = this.systems.filter(s => s.name !== name);
  }

  update(dt: number): void {
    for (const system of this.systems) {
      system.update(this, dt);
    }
    this.processDestroyQueue();
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  getAllEntities(): ReadonlySet<EntityId> {
    return this.entities;
  }

  clear(): void {
    this.entities.clear();
    for (const store of this.components.values()) {
      store.clear();
    }
    this.entitiesToDestroy.length = 0;
  }
}
