import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProblemsPage from './pages/ProblemsPage';
import ProblemPage from './pages/ProblemPage';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<ProblemsPage />} />
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:id" element={<ProblemPage />} />
          <Route path="*" element={<Navigate to="/problems" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
