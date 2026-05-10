import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Product } from '../lib/supabase';
import { ShoppingBag } from 'lucide-react';

const slides = [
  {
    image: '/mezcal_hero.png',
    title: 'El Espíritu de Oaxaca',
    subtitle: 'Mezcal artesanal destilado con tradición y pasión.',
  },
  {
    image: '/coffee_hero.png',
    title: 'Despierta tus Sentidos',
    subtitle: 'Café de altura con un aroma inconfundible y sabor premium.',
  }
];

export const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').limit(6);
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Carousel */}
      <section className="hero-carousel">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="carousel-slide active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <img src={slides[currentSlide].image} alt="Hero" className="carousel-image" />
            <div className="carousel-overlay">
              <div className="carousel-content">
                <motion.h1 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="carousel-title"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="carousel-subtitle"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                <motion.button 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="btn btn-primary"
                >
                  Descubrir Colección
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        <div className="carousel-controls">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="container">
          <h2 className="section-title">Nuestra Selección</h2>
          
          {products.length === 0 ? (
            <div className="text-center" style={{ padding: '40px' }}>
              <p>Aún no hay productos disponibles. Inicia sesión como administrador para agregar.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <motion.div 
                  key={product.id} 
                  className="product-card"
                  whileHover={{ y: -10 }}
                >
                  <div className="product-category">
                    {product.category.toUpperCase()}
                  </div>
                  <div className="product-image-container">
                    <img src={product.image_url} alt={product.name} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-price">${product.price.toFixed(2)}</p>
                    <button className="btn btn-outline" style={{ width: '100%', gap: '10px' }}>
                      <ShoppingBag size={18} /> Agregar al Carrito
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
