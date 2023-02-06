import React from 'react';
import { render } from 'react-dom';
import { View } from './view';

import 'antd/dist/antd.less';
import './index.less';

render(
  <View />,
  globalThis.document.getElementById('popup-container')
);
