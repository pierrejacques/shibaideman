import React from 'react';
import { render } from 'react-dom';
import { ConsolePage } from './console';

render(
  <ConsolePage />,
  window.document.getElementById('console-container')
);
