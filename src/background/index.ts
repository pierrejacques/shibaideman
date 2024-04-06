import { ResultCode, RunningState } from '@/enum';
import { storePorta } from '@/portas/store';
import { cancelTaskMessagePorta, startTaskMessagePorta, requestTaskResultsMessagePorta, taskResultsMessagePorta, requestRemainingPagesMessagePorta, remainingPagesMessagePorta } from '@/portas/message';
import { ParallelScheduler } from '@/core/parallel-scheduler';
import { PageIterable } from '@/core/page-iterable';
import { PageResult, Pages, UrlInfo } from '@/interface';
import { Task } from '@/core/task';
import { INTERRUPT_ERROR } from '@/const';

const ref = {
  results: [] as PageResult[],
  cancelTaskRun: null as () => void,
  remaining: null as Pages,
}

// listen export request
requestTaskResultsMessagePorta.subscribe(
  () => {
    taskResultsMessagePorta.push(ref.results);
  }
)

requestRemainingPagesMessagePorta.subscribe(
  () => {
    remainingPagesMessagePorta.push(ref.remaining);
  }
)

function cancelTask() {
  if (ref.cancelTaskRun) {
    ref.cancelTaskRun();
    ref.cancelTaskRun = null; // remove
  }
}

// listen task cancel
cancelTaskMessagePorta.subscribe(cancelTask)

startTaskMessagePorta.subscribe(
  ({ pages, actionScheme, executionConfig }) => {
    if (storePorta.getValue().runningState !== RunningState.Idle) return;

    const pageIterable = new PageIterable(pages);

    const task = new Task(
      pageIterable,
      new ParallelScheduler(executionConfig),
      actionScheme,
    );

    ref.results = []; // clear
    cancelTask(); // ensure the last task is canceled

    storePorta.push({
      runningState: RunningState.Running,
      totalCount: pageIterable.length,
      doneCount: 0,
      voidCount: 0,
    });

    const taskCancel = task.run(
      (result) => {
        if ('error' in result) {
          if (result.error === INTERRUPT_ERROR) {
            ref.cancelTaskRun(); // interrupt
          }
          return;
        }
        ref.results.push(result);
        storePorta.push(prev => ({
          ...prev,
          doneCount: prev.doneCount + 1,
          voidCount: prev.voidCount + (
            result.code === ResultCode.Void ? 1 : 0
          ),
        }))
      },
      () => {
        storePorta.push(prev => prev.runningState !== RunningState.Interrupted ? ({
          ...prev,
          runningState: RunningState.Completed
        }) : prev);
      }
    );

    ref.cancelTaskRun = () => {
      taskCancel();
      const { iterator } = taskCancel;
      const urls: string[] = [];
      while (true) {
        const next = iterator.next();
        if (next.done) break;
        urls.push((next.value as UrlInfo).url);
      }
      ref.remaining = { urls };
      storePorta.push(prev => prev.runningState !== RunningState.Completed ? ({
        ...prev,
        runningState: RunningState.Interrupted,
      }) : prev);
    };
  }
);

// code preserved for reference
// openConsoleMessagePorta.subscribe(
//   () => {
//     const consolePageURL = chrome.runtime.getURL('console.html');
//     chrome.tabs.query({
//       url: consolePageURL,
//     }, tabs => {
//       if (!tabs.length) {
//         chrome.tabs.create({ url: consolePageURL })
//       } else {
//         chrome.tabs.highlight({ tabs: tabs[0].index });
//       }
//     });
//   }
// )
//
// async function getLocalStorage() {
//   try {
//     return localForage.getItem(STORE_KEY) as Promise<Record<number, string>>;
//   } catch {
//     return {};
//   }
// }
