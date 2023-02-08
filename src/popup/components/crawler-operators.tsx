import { RunningState } from '@/enum';
import { PageResult } from '@/interface';
import { cancelTaskMessagePorta, requestTaskResultsMessagePorta, taskResultsMessagePorta } from '@/portas/message';
import { storePorta } from '@/portas/store';
import { useStorePorta } from '@/utils/hooks';
import { Spin } from 'antd';
import React, { FC, useContext, useEffect, useState } from 'react';
import { Route, routeContext } from '../route';
import { downloadJSONFile } from '../utils';
import { Operator } from './operator';

const ExportOperation: FC = () => {
  const [results, setResults] = useState<PageResult[]>(null);

  useEffect(() => {
    requestTaskResultsMessagePorta.push();
    return taskResultsMessagePorta.subscribe(results => {
      setResults(results);
    });
  }, []);

  const onExport = () => {
    // reset to idle
    downloadJSONFile(results, 'results.json'); // TODO: different name
  }

  return (
    <>
      <Operator disabled={!results} primary onClick={onExport} >
        导出数据
      </Operator>
      <Operator onClick={() => storePorta.push({
        runningState: RunningState.Idle,
        doneCount: 0,
        voidCount: 0,
      })} >
        取消
      </Operator>
    </>
  )
}

export const CrawlerOperators: FC = () => {
  const [, setRouter] = useContext(routeContext);

  const [store] = useStorePorta(storePorta);

  if (!store) return <Spin />

  const { runningState, doneCount, voidCount } = store;

  const sumText = `抓取 ${doneCount} 条数据，其中空数据 ${voidCount} 条`;

  switch (runningState) {
    case RunningState.Completed:
      return (
        <>
          <p className="total">任务完成，共{sumText}</p>
          <div className="operators">
            <ExportOperation />
          </div>
        </>
      );
    case RunningState.Running:
      return (
        <>
          <p className="total">已{sumText}</p>
          <div className="operators">
            <Operator onClick={() => cancelTaskMessagePorta.push()} >终止任务</Operator>
          </div>
        </>
      );
    case RunningState.Idle:
      return (
        <div className="operators">
          <Operator primary onClick={() => setRouter(Route.TaskCreation)} >
            创建抓取任务
          </Operator>
        </div>
      );
    default:
      return null;
  }
}