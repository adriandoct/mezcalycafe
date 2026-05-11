import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { X, Trash2, Plus, Minus, ShoppingCart, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import './Cart.css';

// Reemplaza con tu llave pública de Stripe real
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export const Cart = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, totalPrice } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      // Idealmente, aquí harías una petición POST a tu backend (ej. Supabase Edge Function)
      // para crear una sesión de pago en Stripe y obtener el sessionId.
      // fetch('/create-checkout-session', { method: 'POST', body: JSON.stringify({ items }) })
      
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // SIMULACIÓN: Redirigiremos a un error o mostraremos una alerta, 
      // ya que no hay backend activo generando el Checkout Session.
      alert('Para procesar este pago seguro con Stripe, necesitas configurar tu backend (Edge Functions) para generar el sessionId.');
      
      // Código real esperado:
      // const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      // if (error) console.error(error);
      
    } catch (error) {
      console.error(error);
      alert('Hubo un error al iniciar la compra segura.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cart-overlay"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="cart-sidebar"
          >
            <div className="cart-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShoppingCart size={24} /> Mi Carrito
              </h2>
              <button className="btn-close" onClick={() => setIsCartOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="cart-items">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <ShoppingCart size={48} style={{ color: '#ccc', marginBottom: '20px' }} />
                  <p>Tu carrito está vacío.</p>
                  <button className="btn btn-primary" onClick={() => setIsCartOpen(false)} style={{ marginTop: '20px' }}>
                    Ver Catálogo
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image_url} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <p className="cart-item-price">${item.price.toFixed(2)}</p>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus size={14} />
                          </button>
                        </div>
                        <button className="btn-remove" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total a Pagar</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <button 
                  className="btn btn-primary btn-checkout" 
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  <Lock size={18} /> {loading ? 'Procesando...' : 'Pagar de forma Segura con Stripe'}
                </button>
                <div className="secure-badge">
                  <img src="https://cdn.brandfolder.io/KGT2DTA4/at/rvgw5pc69nhv9wkh7xw5vxc/Powered_by_Stripe_-_blurple.svg" alt="Powered by Stripe" style={{ height: '24px' }} />
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
