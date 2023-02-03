import { actionsDoneMessagePorta } from "@/portas/message";

async function run() {
  chrome.runtime.onMessage.addListener(message => {
    if (Array.isArray(message?.actions)) {
      // action scheme received
      setTimeout(() => {
        actionsDoneMessagePorta.push({
          tabId: message.tabId,
          result: {
            message: `done: ${window.location.search}`,
          }
        });
      }, 1000);
    }
  });
};

run();
