import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ChartData from "./ChartData";
import DataVisualization from "./DataVisualization";
// import FillData from "./FillData";
// import Chat from "./pages/Chat";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="nav-content">
          <a href="/" className="nav-logo">
            Dashboard
          </a>
          <div className="nav-links">
            {/* <Link to="/backup">Backup</Link> */}
            <Link to="/chart">Chart Data</Link>
            <Link to="/visualization">Visualization</Link>
            {/* <Link to="/chat">Chat</Link> */}
          </div>
        </div>
      </nav>

      <main>
        <Routes>
          {/* <Route path="/backup" element={<FillData />} /> */}
          <Route path="/chart" element={<ChartData />} />
          <Route path="/visualization" element={<DataVisualization />} />
          {/* <Route path="/chat" element={<Chat />} /> */}
          <Route path="/" element={<ChartData />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <ul>
              <li>
                <Link to="/about">Our Story</Link>
              </li>
              <li>
                <Link to="/team">Team</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Services</h3>
            <ul>
              <li>
                <Link to="/solutions">Solutions</Link>
              </li>
              <li>
                <Link to="/consulting">Consulting</Link>
              </li>
              <li>
                <Link to="/development">Development</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <ul>
              <li>
                <Link to="/support">Support</Link>
              </li>
              <li>
                <Link to="/sales">Sales</Link>
              </li>
              <li>
                <Link to="/partners">Partners</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </BrowserRouter>
  );
};

export default AppRouter;
