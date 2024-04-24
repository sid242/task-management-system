import React from 'react';
import './App.css';
import Loader from './components/Loader';
import { Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path='/' element={<div>home page</div>} />
      <Route path='/project' element={<div>project</div>} />
      <Route path='*' element={<div>page not found</div>} />
    </Routes>
  );
}

export default App;
