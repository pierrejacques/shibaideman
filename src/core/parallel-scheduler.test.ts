import { timeout } from "@/util/lang";
import { ParallelScheduler } from "./parallel-scheduler";

describe('Scheduler', () => {
  const tasks = [
    400,
    200,
    100,
    600,
    100,
    100,
    200,
    700,
    500
  ];

  const createExecuteNext = () => {
    let i = -1;
    const doneOrder: number[] = [];
    return {
      getDoneOrder: () => {
        return doneOrder;
      },
      next: (): Promise<void> | null => {
        i++;
        const index = i;
        const task = tasks[index];
        if (task) {
          return timeout(task).then(
            () => {
              doneOrder.push(index)
            }
          );
        }
        return null;
      }
    }
  }

  test('Single Thread', async () => {
    const { getDoneOrder, next } = createExecuteNext();

    const scheduler = new ParallelScheduler({
      parallel: 1,
      intervalMs: 0,
    });

    await scheduler.start(() => next);

    expect(getDoneOrder()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('Four Threads', async () => {
    const { getDoneOrder, next } = createExecuteNext();

    const scheduler = new ParallelScheduler({
      parallel: 4,
      intervalMs: 0,
    });

    await scheduler.start(() => next);

    expect(getDoneOrder()).toEqual([2, 1, 4, 5, 0, 6, 3, 8, 7]);
  });

  test('Four Threads with Interval', async () => {
    const { getDoneOrder, next } = createExecuteNext();

    const scheduler = new ParallelScheduler({
      parallel: 4,
      intervalMs: 250,
    });

    await scheduler.start(() => next);

    expect(getDoneOrder()).toEqual([2, 1, 4, 5, 0, 3, 6, 8, 7]);
  })
});
