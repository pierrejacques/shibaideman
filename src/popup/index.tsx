import React from 'react';
import { render } from 'react-dom';
import { Popup } from './popup';

render(
  <Popup />,
  globalThis.document.getElementById('popup-container')
);
