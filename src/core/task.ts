import { ResultCode } from "@/enum";
import { ActionScheme, PageResult, UrlInfo } from "@/interface";
import { actionsDoneMessagePorta } from "@/portas/message";
import { catchRuntimeError, createResolvable, timeout } from "@/utils/lang";
import { ExecutiveIterator, Schedulable } from "./interface";

const TIMEOUT_IN_MILLISECONDS = 1000 * 60;

export class Task {
  constructor(
    private iterable: Iterable<UrlInfo>, // what are the pages
    private schedulable: Schedulable, // how to schedule the pages
    private actionScheme: ActionScheme, // do what on each page
  ) { }

  run(onResult?: (data: PageResult) => void, onFinished?: () => void): () => void {
    let done = false;

    const iterator = this.iterable[Symbol.iterator]();
    const tabResolveMap = new Map<number, (result: any) => void>();

    let cleanup: () => void;

    const executiveIterator: ExecutiveIterator = () => {
      if (!cleanup) {
        const tabOnUpdatedCallback = (id: number, info: any) => {
          // if flag is present, doesn't have to wait for the tab to complete its loading
          if (tabResolveMap.has(id) && (this.actionScheme.flag || info?.status === 'complete')) {
            chrome.tabs.sendMessage<ActionScheme & { tabId: number }>(id, {
              ...this.actionScheme,
              tabId: id,
            }, catchRuntimeError);
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

        const actionResolvable = createResolvable<Omit<PageResult, 'page'>>();
        const page = next.value as UrlInfo;

        chrome
          .tabs
          .create({
            url: page.url,
            active: false,
          })
          .then(({ id }) => {
            tabId = id;
            tabResolveMap.set(id, actionResolvable.resolve);
          })
          .catch((e) => {
            console.log('tabs error', e);
          });

        Promise.race([
          timeout(TIMEOUT_IN_MILLISECONDS).then(
            () => ({ data: {}, code: ResultCode.Timeout })
          ),
          actionResolvable.promise
        ]).then(
          data => {
            onResult({ ...data, page })
          }
        ).finally(() => {
          if (tabId) {
            tabResolveMap.delete(tabId);
            chrome.tabs.remove(tabId).catch(() => { });
          };
          resolve();
        }).catch((e) => {
          console.log('error occurred in page', page.url, (e as Error).message);
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