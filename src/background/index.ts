import localForage from 'localforage';
import { STORE_KEY } from '@/const';
import { RunningState } from '@/enum';
import { timeout } from '@/util/lang';
import { runningStatePorta } from '@/portas/store';
import { getItemMessagePorta, openConsoleMessagePorta, postItemMessagePorta, responseItemMessagePorta, startTaskMessagePorta } from '@/portas/message';

const INTERVAL = 2000;
const STORE_COUNT = 10;

async function getLocalStorage() {
  try {
    return localForage.getItem(STORE_KEY) as Promise<Record<number, string>>;
  } catch {
    return {};
  }
}

async function runTask(task: [number, string][], dict: Record<number, string>) {
  const searchIndexDict: Record<string, number> = {};
  const searchs: string[] = [];

  for (const [index, search] of task) {
    searchIndexDict[search] = index;
    searchs.push(search);
  }

  runningStatePorta.push(RunningState.Running);

  let count = 0;
  const cleanup = postItemMessagePorta.subscribe(
    ({ search, desc }) => {
      const index = searchIndexDict[search];
      console.log('item/post', search, desc, index);
      if (!index) return;
      dict[index] = desc;
      count++;
      if (!(count % STORE_COUNT)) {
        console.log('update localStorage');
        localForage.setItem(STORE_KEY, dict);
      }
    }
  );

  for (const search of searchs) {
    if (runningStatePorta.getValue() !== RunningState.Running) {
      cleanup();
      return;
    };
    const index = searchIndexDict[search];
    if (!index || dict[index]) continue;
    console.log('crawling', search);
    chrome.tabs.create({
      url: `https://baike.baidu.com/item/${encodeURIComponent(search)}`,
    });
    await timeout(INTERVAL);
  }
}

const run = async () => {
  const dict = (await getLocalStorage()) || {};

  startTaskMessagePorta.subscribe(
    (task) => runTask(task, dict)
  );

  openConsoleMessagePorta.subscribe(
    () => {
      const consolePageURL = chrome.runtime.getURL('console.html');
      chrome.tabs.query({
        url: consolePageURL,
      }, tabs => {
        if (!tabs.length) {
          chrome.tabs.create({ url: consolePageURL })
        } else {
          chrome.tabs.highlight({ tabs: tabs[0].index });
        }
      });
    }
  )

  getItemMessagePorta.subscribe(
    async () => {
      const data = await getLocalStorage();
      responseItemMessagePorta.push(data);
    }
  )
}

run();
