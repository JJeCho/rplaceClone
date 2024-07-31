import React from 'react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Canvas from './components/Canvas';
import { Container, Grid, Paper } from '@mui/material';

function App() {
  return (
    <Provider store={store}>
      <Canvas />
    </Provider>
  );
}

export default App;
