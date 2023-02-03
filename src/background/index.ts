import localForage from 'localforage';
import { STORE_KEY } from '@/const';
import { RunningState } from '@/enum';
import { timeout } from '@/util/lang';
import { runningStatePorta } from '@/portas/store';
import { getItemMessagePorta, openConsoleMessagePorta, postItemMessagePorta, startTaskMessagePorta } from '@/portas/message';
import { ParallelScheduler } from '@/core/parallel-scheduler';
import { PageIterable } from '@/core/page-iterable';
import { PageResult, Pages } from '@/interface';
import { Task } from '@/core/task';

const INTERVAL = 2000;
const STORE_COUNT = 10;

const testPages: Pages = {
  urls: [
    {
      template: 'https://s.weibo.com/weibo?q=%23{keyword}%23',
      source: {
        keyword: [
          '过年抢红包可以有多拼',
          '10月最后一天',
          '运气最爆棚的一次经历',
          '初恋那件小事预告',
          '秋冬通勤穿搭',
          '越南进球',
          '奇迹笨小孩不剧透影评',
          '小空间放大术',
          '上海刚刚下雪了',
          '郑州摘星指日可待',
          '宝马太虎了',
        ]
      }
    }
  ]
};

// async function getLocalStorage() {
//   try {
//     return localForage.getItem(STORE_KEY) as Promise<Record<number, string>>;
//   } catch {
//     return {};
//   }
// }

const run = async () => {
  startTaskMessagePorta.subscribe(
    () => {
      // TODO: results 结构的完善，顺序先后的问题
      const results: PageResult[] = [];

      const task = new Task(
        new PageIterable(testPages),
        new ParallelScheduler({
          parallel: 4,
          intervalMs: 5000,
        }),
        {
          actions: []
        }
      );

      task.run(
        result => results.push(result),
        () => console.log('results', results)
      );
    }
  );

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
  // getItemMessagePorta.subscribe(
  //   async () => {
  //     const data = await getLocalStorage();
  //     responseItemMessagePorta.push(data);
  //   }
  // )
}

run();
