import { actionsDoneMessagePorta } from "@/portas/message";
import { ActionRunner, queryTarget } from '@/core/action-runner';
import { ActionScheme } from "@/interface";

async function run() {
  let executable = true;
  chrome.runtime.onMessage.addListener((message: ActionScheme & { tabId: number }) => {
    console.log('message', message, message.flag ?? queryTarget(document, message.flag));
    if (
      executable &&
      Array.isArray(message?.actions) &&
      (!message?.flag || queryTarget(document, message.flag)) // if flag is present, then once the flag is matched, execute the runner
    ) {
      executable = false;
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
