import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import AddLedger from './ManageLedger';
import AddEntry from './AddEntry';
import ViewLedger from './ViewLedger';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddLedger />} />
        <Route path="/add-entry" element={<AddEntry />} />
        <Route path="/view-ledger" element={<ViewLedger />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
