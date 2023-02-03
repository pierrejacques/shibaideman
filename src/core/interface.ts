export interface ExecutiveIterator {
  (): null | Promise<void>;
}

export interface Schedulable {
  start(executiveIterator: ExecutiveIterator): Promise<void>;
  halt(): void;
}

