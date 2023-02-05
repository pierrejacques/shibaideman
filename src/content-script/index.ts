import { actionsDoneMessagePorta } from "@/portas/message";
import { ActionRunner } from '@/core/action-runner';

async function run() {
  chrome.runtime.onMessage.addListener(message => {
    if (Array.isArray(message?.actions)) {
      // action scheme received
      const runner = new ActionRunner(message.actions);

      runner
        .run()
        .then(
          (result) => {
            actionsDoneMessagePorta.push({
              tabId: message.tabId,
              result
            });
          }
        )
        .catch(
          (e) => {
            actionsDoneMessagePorta.push({
              tabId: message.tabId,
              result: {
                error: (e as Error).message
              }
            });
          }
        )
    }
  });
};

run();
