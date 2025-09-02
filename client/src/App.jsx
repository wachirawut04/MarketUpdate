import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Home, Market, Download, Graph, SignIn, SignUp, User,CustomReport,CustomTable } from './pages/Index.jsx';
import Nav from './Components/Nav.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on app start
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      <Nav user={user} />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Market" element={<Market />} />
          <Route path="/Download" element={<Download />} />
          <Route path="/Graph" element={<Graph />} />
          <Route path="/SignIn" element={<SignIn setUser={setUser} />} />
          <Route path="/SignUp" element={<SignUp setUser={setUser} />} />
          <Route path="/User" element={<User user={user} setUser={setUser} />} />
          <Route path="/CustomTable" element={<CustomTable />} />
          <Route path="/CustomReport" element={<CustomReport />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
