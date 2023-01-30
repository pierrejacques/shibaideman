import { ExecutionConfig } from "@/interface";
import { timeout } from "@/util/lang";

export interface ExecuteNext {
  (): null | Promise<void>;
}

export class Scheduler {
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

  public start(executeNext: ExecuteNext): Promise<void> {
    const promise = new Promise<void>((resolve) => { this.resolve = resolve });

    this.tryExecute(executeNext);

    return promise;
  }

  public stop() {
    if (this.resolve) {
      this.resolve();
      this.resolve = null;
      this.noMore = false;
      this.occupied = 0;
    }
  }

  private tryExecute(executeNext: ExecuteNext) {
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
      this.stop();
    }
  }
}
