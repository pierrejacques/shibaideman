import { RunningState } from '@/enum';
import { storePorta } from '@/portas/store';
import { cancelTaskMessagePorta, startTaskMessagePorta, requestTaskResultsMessagePorta, taskResultsMessagePorta } from '@/portas/message';
import { ParallelScheduler } from '@/core/parallel-scheduler';
import { PageIterable } from '@/core/page-iterable';
import { PageResult } from '@/interface';
import { Task } from '@/core/task';

const run = async () => {
  // init idle
  // storePorta.push({
  //   runningState: RunningState.Idle,
  //   doneCount: 0,
  // });

  startTaskMessagePorta.subscribe(
    ({ pages, actionScheme, executionConfig }) => {
      if (storePorta.getValue().runningState !== RunningState.Idle) return;

      storePorta.push({
        runningState: RunningState.Running,
        doneCount: 0,
      });

      const results: PageResult[] = [];

      const task = new Task(
        new PageIterable(pages),
        new ParallelScheduler(executionConfig),
        actionScheme
      );

      const subcriptions = {
        run: task.run(
          result => {
            results.push(result);
            storePorta.push({
              runningState: RunningState.Running,
              doneCount: results.length
            })
          },
          () => {
            storePorta.push({
              runningState: RunningState.Completed,
              doneCount: results.length,
            });

            const popupRequestSubcription = requestTaskResultsMessagePorta.subscribe(
              () => {
                taskResultsMessagePorta.push(results);
              }
            )

            // for unsubscription purpose
            const stateSubscription = storePorta.subscribe(({ runningState }) => {
              if (runningState !== RunningState.Completed) {
                // CHECK: cleanup
                popupRequestSubcription();
                stateSubscription();
              }
            });
          }
        ),
        cancel: cancelTaskMessagePorta.subscribe(() => {
          subcriptions.run(); // cancel run
          subcriptions.cancel(); // unsubscribe self
        })
      }
    }
  );
}

run();

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
