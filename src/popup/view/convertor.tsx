import { Form, message } from "antd";
import React, { FC, useState } from "react";
import { Operator } from "../components/operator";
import { Layout } from "./layout";
import { downloadFile, readFile, selectFile } from '../utils';
import { convertTableLike } from "@/utils/format";

export const Convertor: FC = () => {
  const [{
    inputFile,
    configFile,
  }, setState] = useState<{
    inputFile: File;
    configFile: File;
  }>({
    inputFile: null,
    configFile: null
  });

  const onSubmit = async () => {
    try {
      const [inputFileStr, configFileStr] = await Promise.all([
        readFile(inputFile),
        readFile(configFile),
      ]);

      const config = JSON.parse(configFileStr);
      const outputFileStr = convertTableLike(config, inputFileStr);

      const outputFileName = inputFile.name.replace(new RegExp(`${config.from}$`), config.to);
      downloadFile(outputFileStr, outputFileName);

      message.success('数据转换完成');
    } catch (e) {
      message.error({
        title: '数据转换发生错误',
        content: (e as Error).message
      });
    }
  };

  return (
    <Layout
      title="数据转换"
    >
      <Form id="convert" onFinish={onSubmit} >
        <Form.Item label="数据文件" >
          <Operator onClick={() => selectFile('*', inputFile => setState(prev => ({ ...prev, inputFile })))} >
            {inputFile ? inputFile.name : '选择数据文件'}
          </Operator>
        </Form.Item>
        <Form.Item label="配置文件" >
          <Operator onClick={() => selectFile('application/json', configFile => setState(prev => ({ ...prev, configFile })))} >
            {configFile ? configFile.name : '选择配置文件'}
          </Operator>
        </Form.Item>
        <div className="operators" >
          <Operator disabled={!inputFile || !configFile} primary submit >
            开始转换
          </Operator>
        </div>
      </Form>
    </Layout>
  );
}
