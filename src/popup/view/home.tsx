import React, { FC, useContext } from "react";
import { CrawlerOperators } from "../components/crawler-operators";
import { Operator } from "../components/operator";
import { routeContext, Route } from "../route";
import { Layout } from "./layout";

export const Home: FC = () => {
  const [, setRoute] = useContext(routeContext);

  return (
    <Layout
      title="失败的Man"
    >
      <h2 className="subtitle" >网页抓取</h2>
      <CrawlerOperators />
      <h2 className="subtitle" >数据转换</h2>
      <div className="operators">
        <Operator primary onClick={() => setRoute(Route.Convertor)} >
          开始数据转换
        </Operator>
      </div>
    </Layout>
  );
}
