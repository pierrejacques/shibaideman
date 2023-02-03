import React, { FC, useCallback } from 'react';
import { Button } from 'antd';
import { startTaskMessagePorta } from '@/portas/message';
import 'antd/dist/antd.less';
import './popup.less';

export const Popup: FC = () => {
  const onStartTask = useCallback(() => {
    startTaskMessagePorta.push();
  }, []);

  return (
    <>
      <header className="header">
        <h1 className="title">ShiBaiDeMan</h1>
      </header>
      <footer className="footer">
        <Button size="large" type="primary" className="button" onClick={onStartTask} >
          RUN
        </Button>
      </footer>
    </>
  )
}