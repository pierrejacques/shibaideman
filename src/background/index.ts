import { ResultCode, RunningState } from '@/enum';
import { storePorta } from '@/portas/store';
import { cancelTaskMessagePorta, startTaskMessagePorta, requestTaskResultsMessagePorta, taskResultsMessagePorta } from '@/portas/message';
import { ParallelScheduler } from '@/core/parallel-scheduler';
import { PageIterable } from '@/core/page-iterable';
import { PageResult } from '@/interface';
import { Task } from '@/core/task';

const ref = {
  results: [] as PageResult[],
  cancelTaskRun: null as () => void,
}

// listen export request
requestTaskResultsMessagePorta.subscribe(
  () => {
    taskResultsMessagePorta.push(ref.results);
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

    const task = new Task(
      new PageIterable(pages),
      new ParallelScheduler(executionConfig),
      actionScheme
    );

    ref.results = []; // clear
    cancelTask(); // ensure the last task is canceled

    storePorta.push({
      runningState: RunningState.Running,
      doneCount: 0,
      voidCount: 0,
    });

    ref.cancelTaskRun = task.run(
      (result) => {
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
        storePorta.push(prev => ({
          ...prev,
          runningState: RunningState.Completed,
        }));
      }
    );
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
