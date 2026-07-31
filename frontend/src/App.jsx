import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Leads from './pages/Leads';
import Cadastro from './pages/Cadastro';
import Lixeira from './pages/Lixeira';
import Historico from './pages/Historico';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Leads />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/editar/:id" element={<Cadastro />} />
        <Route path="/lixeira" element={<Lixeira />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
