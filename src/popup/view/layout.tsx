import { Button } from "antd";
import React, { FC, ReactNode, useContext } from "react";
import { Route, routeContext } from "../route";

export const Layout: FC<{
  title: ReactNode;
  children: ReactNode | ReactNode[];
}> = ({
  title,
  children,
}) => {
    const [route, setRoute] = useContext(routeContext);

    return (
      <>
        <header className="header" >
          {route !== Route.Home ? (
            <Button className="back_btn" type="link" onClick={() => setRoute(Route.Home)} >
              {'< 返回'}
            </Button>
          ) : null}
          <h1 className="title" >{title}</h1>
        </header>
        <main className="main" >
          {children}
        </main>
      </>
    )
  };