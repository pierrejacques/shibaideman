import { ActionScheme } from "@/interface";
import { actionsDoneMessagePorta } from "@/portas/message";
import { createResolvable, timeout } from "@/util/lang";
import { ExecutiveIterator, Schedulable } from "./interface";

export class Task {
  constructor(
    private iterable: Iterable<string>,
    private schedulable: Schedulable,
    private actionScheme: ActionScheme,
  ) { }

  run(onResult?: (result: any) => void, onFinished?: () => void): () => void {
    let done = false;

    const iterator = this.iterable[Symbol.iterator]();
    const tabResolveMap = new Map<number, (result: any) => void>();

    let cleanup: () => void;

    const executiveIterator: ExecutiveIterator = () => {
      if (!cleanup) {
        const tabOnUpdatedCallback = (id: number, info: any) => {
          if (tabResolveMap.has(id) && info?.status === 'complete') {
            chrome.tabs.sendMessage<ActionScheme & { tabId: number }>(id, {
              ...this.actionScheme,
              tabId: id,
            });
          }
        }

        chrome.tabs.onUpdated.addListener(tabOnUpdatedCallback);
        const unsub = actionsDoneMessagePorta.subscribe(({ tabId, result }) => {
          if (tabResolveMap.has(tabId)) {
            tabResolveMap.get(tabId)(result);
          }
        });

        cleanup = () => {
          chrome.tabs.onUpdated.removeListener(tabOnUpdatedCallback);
          unsub();
        }
      }
      const next = iterator.next();
      if (next.done) return null;

      return new Promise<void>((resolve) => {
        let tabId: number;

        const actionResolvable = createResolvable<any>();

        chrome
          .tabs
          .create({ url: next.value as string })
          .then(({ id }) => {
            tabId = id;
            tabResolveMap.set(id, actionResolvable.resolve);
          })
          .catch((e) => {
            console.log('tabs error', e);
          });

        Promise.race([
          timeout(30000), // timeout for 30seconds
          actionResolvable.promise.then(
            (result) => {
              onResult(result);
            }
          )
        ]).finally(() => {
          if (tabId) {
            tabResolveMap.delete(tabId);
            chrome.tabs.remove(tabId);
          };
          resolve();
        });
      });
    }

    this.schedulable
      .start(executiveIterator)
      .finally(() => {
        done = true;
        cleanup?.();
        onFinished?.();
      });

    return () => {
      if (!done) {
        this.schedulable.halt();
      }
    };
  }
}