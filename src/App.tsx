import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { supabase } from './lib/supabase';
import { LogIn } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img src="/mezcal_hero.png" alt="Logo" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
          Agave & Grano
        </Link>
        <div className="navbar-nav">
          <Link to="/" className="nav-link">Inicio</Link>
          <a href="#" className="nav-link">Catálogo</a>
          <a href="#" className="nav-link">Nosotros</a>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ padding: '8px 16px' }}>Mi Panel</Link>
          ) : (
            <Link to="/auth" className="btn btn-outline" style={{ padding: '8px 16px', gap: '8px' }}>
              <LogIn size={18} /> Entrar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer style={{ backgroundColor: 'var(--secondary)', color: 'white', padding: '40px 0', marginTop: 'auto' }}>
    <div className="container text-center">
      <h3 style={{ color: 'var(--primary)', marginBottom: '15px' }}>Agave & Grano</h3>
      <p style={{ color: '#ccc', marginBottom: '20px' }}>La mezcla perfecta entre la tradición del mezcal y la energía del café de altura.</p>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>© 2026 Agave & Grano. Todos los derechos reservados.</p>
    </div>
  </footer>
);

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
