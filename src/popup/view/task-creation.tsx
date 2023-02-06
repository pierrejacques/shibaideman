import { RunningState } from "@/enum";
import { ActionScheme, ExecutionConfig, Pages, TaskCreation as TaskCreationData } from "@/interface";
import { startTaskMessagePorta } from "@/portas/message";
import { storePorta } from "@/portas/store";
import { useStorePorta } from "@/utils/hooks";
import { Form, InputNumber, message } from "antd";
import React, { FC, useContext, useEffect, useState } from "react";
import { Operator } from "../components/operator";
import { Route, routeContext } from "../route";
import { readFile, selectFile, validateActions, validatePages } from "../utils";
import { Layout } from "./layout";

const TaskCreationCore: FC = () => {
  const [{
    pagesFile,
    actionFile,
    parallel,
    intervalMs
  }, setState] = useState<ExecutionConfig & {
    pagesFile: File;
    actionFile: File;
  }>({
    pagesFile: null,
    actionFile: null,
    parallel: 4,
    intervalMs: 3500,
  });

  const onSubmit = async () => {
    try {
      const [pagesStr, actionStr] = await Promise.all([
        readFile(pagesFile),
        readFile(actionFile),
      ]);

      const pages: Pages = JSON.parse(pagesStr);
      validatePages(pages);

      const actionScheme: ActionScheme = JSON.parse(actionStr);
      validateActions(actionScheme.actions);

      const creation: TaskCreationData = {
        pages,
        actionScheme,
        executionConfig: {
          parallel,
          intervalMs
        }
      };

      startTaskMessagePorta.push(creation);

      message.success('开始执行抓取任务');
    } catch (e) {
      message.error({
        title: '任务创建发生错误',
        content: (e as Error).message
      });
    }
  };

  return (
    <Layout
      title="新建抓取任务"
    >
      <Form id="convert" onFinish={onSubmit} >
        <Form.Item label="URL 配置文件" >
          <Operator onClick={() => selectFile('application/json', pagesFile => setState(prev => ({ ...prev, pagesFile })))} >
            {pagesFile ? pagesFile.name : '选择 URL 配置文件'}
          </Operator>
        </Form.Item>
        <Form.Item label="Action 配置文件" >
          <Operator onClick={() => selectFile('application/json', actionFile => setState(prev => ({ ...prev, actionFile })))} >
            {actionFile ? actionFile.name : '选择 Action 配置文件'}
          </Operator>
        </Form.Item>
        <Form.Item label="并发量" >
          <InputNumber min={1} max={8} step={1} value={parallel} onChange={parallel => setState(prev => ({ ...prev, parallel }))} />
        </Form.Item>
        <Form.Item label="每页最小抓取时长（毫秒）" >
          <InputNumber min={0} max={60000} step={500} value={intervalMs} onChange={intervalMs => setState(prev => ({ ...prev, intervalMs }))} />
        </Form.Item>
        <div className="operators" >
          <Operator disabled={!actionFile || !pagesFile || !parallel || intervalMs == null} primary submit >
            开始任务
          </Operator>
        </div>
      </Form>
    </Layout >
  );
}

export const TaskCreation: FC = () => {
  const [store] = useStorePorta(storePorta);

  const [, setRoute] = useContext(routeContext);

  const runningState = store?.runningState;

  useEffect(() => {
    if (runningState !== RunningState.Idle) {
      setRoute(Route.Home);
    }
  }, [runningState]);

  return runningState === RunningState.Idle ? (
    <TaskCreationCore />
  ) : null
}