import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home, Market,Download,Graph } from './pages/Index.jsx';
import './App.css'
import Nav from './Components/Nav.jsx';

function App() {

  return (
    <Router> 
      <Nav />
      <div className='pt-20'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Market" element={<Market />} />
        <Route path="/Download" element={<Download />} />
        <Route path="/Graph" element={<Graph />} />
      </Routes>
      </div>
    </Router>
  )
}

export default App
