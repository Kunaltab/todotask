import { useState, useContext } from 'react';
import { AppContext } from '../App';
import { motion } from 'framer-motion';

export default function Auth() {
  const { setToken } = useContext(AppContext);
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const url = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        if (!isLogin) {
          setIsLogin(true);
          setError('Registration successful! Please log in.');
        } else {
          setToken(data.access_token);
        }
      } else {
        setError(data.detail || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (err) {
      setError('Network Error: Is the backend server running?');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="glass auth-box"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div className="ghibli-logo" style={{fontSize: '32px', textTransform: 'uppercase', letterSpacing: '4px'}}>
            <span>Tasks</span>
          </div>
          <h2 style={{color: 'white', marginTop: '15px', fontSize: '18px', fontWeight: '500'}}>
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input 
            type="text" 
            placeholder="Username" 
            required 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />
          {error && <p style={{color: '#fca5a5', fontSize: '14px', margin: '0'}}>{error}</p>}
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p style={{textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: '20px', cursor: 'pointer', fontSize: '14px'}}
           onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </motion.div>
    </div>
  );
}
