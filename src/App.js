import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Feature from './pages/Feature';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import RegisterStep1 from './pages/RegisterStep1';
import RegisterStep2 from './pages/RegisterStep2';
import Payment from './pages/Payment';

function App() {
  return (
    <Router>
      <div>
        <nav className="bg-green-700 text-white p-4 flex justify-between items-center">
          <div className="text-2xl font-bold">ROCKLAND</div>
          <div className="space-x-4">
            <Link to="/">Home</Link>
            <Link to="/feature">Feature</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/faq">FAQ</Link>
            <Link
              to="/register"
              className="bg-white text-green-700 px-4 py-1 rounded font-semibold"
            >
              Register
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/feature" element={<Feature />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/register" element={<RegisterStep1 />} />
          <Route path="/register/step2" element={<RegisterStep2 />} />
          <Route path="/payment" element={<Payment />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
