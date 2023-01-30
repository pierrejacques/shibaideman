import { timeout } from "@/util/lang";
import { Scheduler } from "./scheduler";

describe('Scheduler', () => {
  const tasks = [
    () => timeout(400),
    () => timeout(200),
    () => timeout(100),
    () => timeout(600),
    () => timeout(100),
    () => timeout(100),
    () => timeout(200),
    () => timeout(700),
    () => timeout(500)
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
          return task().then(
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

    const scheduler = new Scheduler({
      parallel: 1,
      intervalMs: 0,
    });

    await scheduler.start(next);

    expect(getDoneOrder()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('Four Threads', async () => {
    const { getDoneOrder, next } = createExecuteNext();

    const scheduler = new Scheduler({
      parallel: 4,
      intervalMs: 0,
    });

    await scheduler.start(next);

    expect(getDoneOrder()).toEqual([2, 1, 4, 5, 0, 6, 3, 8, 7]);
  });

  test('Four Threads with Interval', async () => {
    const { getDoneOrder, next } = createExecuteNext();

    const scheduler = new Scheduler({
      parallel: 4,
      intervalMs: 250,
    });

    await scheduler.start(next);

    expect(getDoneOrder()).toEqual([2, 1, 4, 5, 0, 3, 6, 8, 7]);
  })
});
