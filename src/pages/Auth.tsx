import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'vendedor' | 'cliente'>('cliente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Pre-configured admin account check
    if (isLogin && email === 'admin@admin.com' && password === '12345678Mezcal') {
      const adminUser = { id: 'admin-id-001', email: 'admin@admin.com' };
      const adminProfile = { id: 'admin-id-001', email: 'admin@admin.com', role: 'admin' as const };
      localStorage.setItem('demo_user', JSON.stringify(adminUser));
      localStorage.setItem('demo_profile', JSON.stringify(adminProfile));
      window.dispatchEvent(new Event('demo_auth_change'));
      setLoading(false);
      navigate('/dashboard');
      return;
    }

    try {
      if (isLogin) {
        // Check local users fallback first
        const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
        const localFound = localUsers.find((u: any) => u.email === email && u.password === password);
        if (localFound) {
          localStorage.setItem('demo_user', JSON.stringify({ id: localFound.id, email: localFound.email }));
          localStorage.setItem('demo_profile', JSON.stringify({ id: localFound.id, email: localFound.email, role: localFound.role }));
          window.dispatchEvent(new Event('demo_auth_change'));
          setLoading(false);
          navigate('/dashboard');
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        localStorage.removeItem('demo_user');
        localStorage.removeItem('demo_profile');
        window.dispatchEvent(new Event('demo_auth_change'));
        navigate('/dashboard');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          // If Supabase API is unreachable, fallback to local storage
          const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
          const newUserId = 'local-' + Date.now();
          localUsers.push({ id: newUserId, email, password, role });
          localStorage.setItem('local_users', JSON.stringify(localUsers));
          alert('Registro exitoso (Modo local). Puedes iniciar sesión ahora.');
          setIsLogin(true);
          setLoading(false);
          return;
        }
        
        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase.from('profiles').insert([
            { id: data.user.id, email, role }
          ]);
          if (profileError) console.error('Profile insert error:', profileError);
        }
        alert('Registro exitoso. Puedes iniciar sesión.');
        setIsLogin(true);
      }
    } catch (err: any) {
      // Fallback for network error
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        const localUsers = JSON.parse(localStorage.getItem('local_users') || '[]');
        const newUserId = 'local-' + Date.now();
        localUsers.push({ id: newUserId, email, password, role });
        localStorage.setItem('local_users', JSON.stringify(localUsers));
        alert('Servidor Supabase no disponible. Cuenta creada en modo local. ¡Puedes iniciar sesión!');
        setIsLogin(true);
      } else {
        setError(err.message || 'Error en autenticación');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{isLogin ? 'Iniciar Sesión' : 'Registro'}</h2>
        
        {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-control" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Rol de Usuario</label>
              <select 
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
              >
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginBottom: '15px' }}
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
          </button>
          
          <div className="text-center">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
