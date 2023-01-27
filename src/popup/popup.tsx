import React, { FC, useCallback, useEffect } from 'react';
import { Button } from 'antd';
import { RunningState } from '@/enum';
import { useStorePorta } from '@/util/hooks';
import { runningStatePorta } from '@/portas/store';
import { getItemMessagePorta, responseItemMessagePorta, startTaskMessagePorta } from '@/portas/message';
import 'antd/dist/antd.less';
import './popup.less';

export const Popup: FC = () => {
  const [runningState, setRunningState] = useStorePorta(runningStatePorta);

  useEffect(() => {
    return responseItemMessagePorta.subscribe(
      (data) => {
        if (data) {
          const str = JSON.stringify(data);
          const blob = new Blob([str]);
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.download = 'data.json';
          anchor.href = url;
          anchor.target = "_blank";
          anchor.click();
        }
      }
    )
  }, []);

  const onExport = useCallback(() => {
    getItemMessagePorta.push();
  }, []);

  const onStartTask = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = 'text/csv';
    input.onchange = () => {
      const list = Array.from(input.files);
      if (list.length) {
        const file = list[0];
        var reader = new FileReader();
        reader.onload = function (e) {
          const fileStr = e.target.result as string;
          startTaskMessagePorta.push(
            fileStr.split('\n').map(
              (row) => {
                const [index, search] = row.trim().split(',');
                return [Number(index), search];
              }
            )
          );
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return (
    <>
      <header className="header">
        <h1 className="title">百度信息</h1>
      </header>
      <footer className="footer">
        <Button size="large" type="primary" className="button" onClick={onExport} >
          导出
        </Button>
        {
          runningState === RunningState.Running ?
            <Button
              className="button"
              onClick={() => setRunningState(RunningState.Idle)}
              size="large" type="primary" danger>
              停止
            </Button> :
            <Button
              className="button"
              onClick={onStartTask}
              size="large" type="primary" >
              启动
            </Button>
        }
      </footer>
    </>
  )
}