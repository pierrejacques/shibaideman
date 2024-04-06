import { RunningState } from '@/enum';
import { cancelTaskMessagePorta, remainingPagesMessagePorta, requestRemainingPagesMessagePorta, requestTaskResultsMessagePorta, taskResultsMessagePorta } from '@/portas/message';
import { storePorta } from '@/portas/store';
import { useStorePorta } from '@/utils/hooks';
import { Spin } from 'antd';
import React, { FC, useContext, useEffect } from 'react';
import { Route, routeContext } from '../route';
import { downloadJSONFile } from '../utils';
import { Operator } from './operator';

const ExportOperator: FC<{
  finished?: boolean
}> = ({
  finished
}) => {
    useEffect(() => {
      return taskResultsMessagePorta.subscribe(results => {
        downloadJSONFile(results, 'results.json');
      });
    }, []);

    const onExport = () => {
      requestTaskResultsMessagePorta.push();
    }

    useEffect(() => {
      if (finished) { // once finished, export the file
        onExport();
      }
    }, [finished]);

    return (
      <Operator primary onClick={onExport} >
        导出数据
      </Operator>
    )
  }

const RemainingOperator: FC = () => {
  const onExport = () => {
    requestRemainingPagesMessagePorta.push();
  }

  useEffect(() => {
    onExport();
    return remainingPagesMessagePorta.subscribe(results => {
      downloadJSONFile(results, 'pages-remaining.json');
    });
  }, []);

  return (
    <Operator primary onClick={onExport} >
      导出剩余页面
    </Operator>
  )
}

const CancelOperator: FC = () => (
  <Operator onClick={() => storePorta.push(prev => ({
    ...prev,
    runningState: RunningState.Idle,
    doneCount: 0,
    voidCount: 0,
  }))} >
    取消
  </Operator>
)

export const CrawlerOperators: FC = () => {
  const [, setRouter] = useContext(routeContext);

  const [store] = useStorePorta(storePorta);

  if (!store) return <Spin />

  const { runningState, doneCount, totalCount, voidCount } = store;

  const sumText = `抓取 ${doneCount}/${totalCount} 条数据，其中空数据 ${voidCount} 条`;

  switch (runningState) {
    case RunningState.Completed:
      return (
        <>
          <p className="total">任务完成，共{sumText}</p>
          <div className="operators">
            <ExportOperator finished />
            <CancelOperator />
          </div>
        </>
      );
    case RunningState.Interrupted:
      return (
        <>
          <p className="total">任务中断，已{sumText}</p>
          <div className="operators">
            <ExportOperator finished />
            <RemainingOperator />
            <CancelOperator />
          </div>
        </>
      );
    case RunningState.Running:
      return (
        <>
          <p className="total">已{sumText}</p>
          <div className="operators">
            <ExportOperator />
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