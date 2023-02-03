import { ExecutionConfig } from "@/interface";
import { timeout } from "@/util/lang";
import { ExecutiveIterator, Schedulable } from "./interface";

export class ParallelScheduler implements Schedulable {
  private resolve: () => void = null;

  private noMore = false;

  private occupied = 0;

  private parallel: number;

  private intervalMs: number;

  constructor(
    { parallel, intervalMs }: ExecutionConfig,
  ) {
    this.parallel = parallel;
    this.intervalMs = intervalMs;
  }

  public start(executiveIterator: ExecutiveIterator): Promise<void> {
    const promise = new Promise<void>((resolve) => { this.resolve = resolve });
    this.tryExecute(executiveIterator);

    return promise;
  }

  public halt() {
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
      this.noMore = false;
      this.occupied = 0;
    }
  }

  private tryExecute(executeNext: ExecutiveIterator) {
    if (!this.resolve) return;
    if (this.noMore) {
      this.tryStop();
      return;
    }
    if (this.occupied < this.parallel) {
      const capacity = this.parallel - this.occupied;
      for (let i = 0; i < capacity; i++) {
        const execution = executeNext();
        if (!execution) {
          this.noMore = true;
          this.tryStop();
          break;
        }

        this.occupied++;

        const promises = [execution];

        if (this.intervalMs) {
          promises.push(timeout(this.intervalMs));
        }

        Promise.all(promises).finally(() => {
          this.occupied--;
          this.tryExecute(executeNext);
        });
      }
    }
  }

  private tryStop() {
    if (!this.occupied) {
      this.halt();
    }
  }
}
