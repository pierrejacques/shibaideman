import React, { FC, memo, ReactNode, useEffect, useState } from 'react';
import { Button, Spin } from 'antd';
import { cancelTaskMessagePorta, requestTaskResultsMessagePorta, startTaskMessagePorta, taskResultsMessagePorta } from '@/portas/message';
import { useStorePorta } from '@/util/hooks';
import { runningStatePorta } from '@/portas/store';
import { RunningState } from '@/enum';
import { PageResult, TaskCreation } from '@/interface';
import { downloadFile, downloadJSONFile, readFile, readJSONFile } from './utils';
import { convertTableLike } from '@/util/format';

import 'antd/dist/antd.less';
import './popup.less';

const Operator: FC<{
  onClick(): void;
  primary?: boolean;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode | ReactNode[];
}> = memo(({
  onClick,
  primary = false,
  danger = false,
  disabled = false,
  children
}) => (
  <Button disabled={disabled} size="large" type={primary ? 'primary' : 'default'} danger={danger} className='button' onClick={onClick} >{children}</Button>
))

const INITIAL_TASK_CREATION: TaskCreation = {
  pages: null,
  actionScheme: null,
  executionConfig: {
    parallel: 4,
    intervalMs: 5000,
  },
};

enum CreateTaskStage {
  UploadingUrlScheme,
  UploadingActionScheme,
  SetScheduleConfigs,
}

const StartTaskOperation: FC = () => {
  const [status, setStatus] = useState<CreateTaskStage>(CreateTaskStage.UploadingUrlScheme);

  const [, setTaskCreation] = useState<TaskCreation>(INITIAL_TASK_CREATION);

  const cancelButton = (
    <Operator primary danger onClick={() => setStatus(CreateTaskStage.SetScheduleConfigs)} >取消</Operator>
  );

  switch (status) {
    case CreateTaskStage.UploadingUrlScheme:
      return (
        <Operator primary onClick={() => readJSONFile(pages => {
          setTaskCreation(prev => ({ ...prev, pages }));
          setStatus(CreateTaskStage.UploadingActionScheme);
        })} >
          选择 URL 文件新建任务
        </Operator>
      );
    case CreateTaskStage.UploadingActionScheme:
      return (
        <>
          <Operator onClick={() => readJSONFile(actionScheme => {
            setTaskCreation(prev => {
              const next = { ...prev, actionScheme }
              startTaskMessagePorta.push(next);
              return next;
            });
          })} >
            选择 Action 文件
          </Operator>
          {cancelButton}
        </>
      );
    case CreateTaskStage.SetScheduleConfigs:
      return (
        <>
          {cancelButton}
        </>
      );
    default:
      return null;
  }
};

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
        导出
      </Operator>
      <Operator onClick={() => runningStatePorta.push(RunningState.Idle)} >
        取消
      </Operator>
    </>
  )
}

const CrawlerOperation: FC = () => {
  const [runningState] = useStorePorta(runningStatePorta);

  switch (runningState) {
    case RunningState.Completed:
      return <ExportOperation />
    case RunningState.Running:
      return <Operator danger onClick={() => cancelTaskMessagePorta.push()} >终止</Operator>;
    case RunningState.Idle:
      return <StartTaskOperation />
    default:
      return <Spin />
  }
}

const ConvertOperation: FC = () => {
  const [state, setState] = useState<{
    content: string;
    name: string;
  }>(null);

  return state ? (
    <Operator onClick={() => readJSONFile(config => {
      try {
        const output = convertTableLike(config, state.content);
        const outputFileName = state.name.replace(new RegExp(`${config.from}$`), config.to);
        downloadFile(output, outputFileName);
      } catch (e) {
        console.log('convert error', e);
      }
      setState(null);
    })} >
      选择转换配置文件
    </Operator>
  ) : (
    <Operator onClick={() => readFile('*', (content, name) => {
      setState({
        content,
        name
      });
    })} >
      选择文件进行转换
    </Operator>
  )
}

export const Popup: FC = () => (
  <>
    <header className="header">
      <h1 className="title">ShiBaiDeMan</h1>
    </header>
    <section className="section">
      <h2>Crawler</h2>
      <div className="operations">
        <CrawlerOperation />
      </div>
    </section>
    <section className="section">
      <h2>Converter</h2>
      <div className="operations">
        <ConvertOperation />
      </div>
    </section>
  </>
)