import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { LogIn, ShoppingCart, Menu, X } from 'lucide-react';
import { CartProvider, useCart } from './context/CartContext';
import { Cart } from './components/Cart';

const Navbar = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { totalItems, setIsCartOpen } = useCart();

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
      <div className="container" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Link to="/" className="navbar-brand">
            <img src="/mezcal_hero.png" alt="Logo" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
            Agave & Grano
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Carrito siempre visible en móvil */}
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', border: 'none', position: 'relative', display: 'flex' }}
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={22} color="var(--primary)" />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute', top: '0', right: '0',
                  background: 'var(--primary)', color: 'white',
                  borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {totalItems}
                </span>
              )}
            </button>
            
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        <div className={`navbar-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={!isMobileMenuOpen && window.innerWidth > 768 ? { display: 'flex', width: 'auto', border: 'none', marginTop: 0 } : {}}>
          <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
          <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Catálogo</a>
          <a href="#" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Nosotros</a>
          
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Mi Panel</Link>
          ) : (
            <Link to="/auth" className="btn btn-outline" style={{ gap: '8px' }} onClick={() => setIsMobileMenuOpen(false)}>
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
    <CartProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Cart />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
