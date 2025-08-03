import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home, Market,Download,Graph } from './pages/Index.jsx';
import './App.css'

function App() {

  return (
    <Router> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Market" element={<Market />} />
        <Route path="/Download" element={<Download />} />
        <Route path="/Graph" element={<Graph />} />
      </Routes>
    </Router>
  )
}

export default App
