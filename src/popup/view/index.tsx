import React, { FC, useState } from 'react';
import { Route, routeContext } from '../route';
import { Home } from './home';
import { TaskCreation } from './task-creation';
import { Convertor } from './convertor';

const dict: Record<Route, FC> = {
  [Route.Home]: Home,
  [Route.TaskCreation]: TaskCreation,
  [Route.Convertor]: Convertor,
}

export const View: FC = () => {
  const tuple = useState(Route.Home);

  const route = tuple[0];
  const ViewComponent = dict[route];

  return (
    <routeContext.Provider value={tuple} >
      <ViewComponent key={route} />
    </routeContext.Provider>
  )
}
