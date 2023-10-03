import { actionsDoneMessagePorta } from "@/portas/message";
import { ActionRunner, queryTarget } from '@/core/action-runner';
import { Action, ActionScheme } from "@/interface";

async function run() {
  let executable = true;
  let interval: ReturnType<typeof setInterval>;

  function syncExecute(tabId: number, actions: Action[]) {
    if (!executable) return; // double check

    executable = false;
    // action scheme received
    const runner = new ActionRunner(actions);

    runner
      .run()
      .then(
        (result) => {
          actionsDoneMessagePorta.push({
            tabId,
            result
          });
        }
      )
      .catch(
        (e) => {
          actionsDoneMessagePorta.push({
            tabId,
            result: {
              error: (e as Error).message
            }
          });
        }
      )
  }

  chrome.runtime.onMessage.addListener((message: ActionScheme & { tabId: number }) => {
    if (
      executable &&
      Array.isArray(message?.actions)
    ) {
      if (message.flag) {
        if (!interval) {
          // sync execute
          if (queryTarget(document, message.flag)) {
            // if flag is present, then once the flag is matched, execute the runner
            syncExecute(message.tabId, message.actions);
          } else {
            // async execute
            interval = setInterval(() => {
              if (!executable) {
                clearInterval(interval);
                return;
              }
              if (queryTarget(document, message.flag)) {
                // if flag is present, then once the flag is matched, execute the runner
                syncExecute(message.tabId, message.actions);
                clearInterval(interval);
              }
            }, 300);
          }
        }
      } else {
        // status ===  complete, sync execute at once
        syncExecute(message.tabId, message.actions);
      }
    }
  });
};

run();
