import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { AppContext } from '../App';

export default function Sidebar({ tasks, filterType, setFilterType }) {
  const { themeMode, setThemeMode } = useContext(AppContext);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hrs = time.getHours();
  const mins = time.getMinutes();
  const secs = time.getSeconds();
  
  const hrDeg = (hrs * 30) + (mins / 2);
  const minDeg = (mins * 6) + (secs / 10);
  const secDeg = secs * 6;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <aside className="sidebar glass">
      <div className="sidebar-section" style={{textAlign: 'center', padding: '10px 0'}}>
        <div className="ghibli-logo" style={{fontSize: '28px', textTransform: 'uppercase', letterSpacing: '4px'}}>
          <span>Tasks</span>
        </div>
      </div>

      <div className="sidebar-section" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <h4 style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '15px'}}>Current Time</h4>
        <div className="clock-container">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="clock-number" style={{ transform: `rotate(${(i + 1) * 30}deg)` }}>
              <span style={{ transform: `rotate(-${(i + 1) * 30}deg)` }}>{i + 1}</span>
            </div>
          ))}
          <div className="clock-hand hour-hand" style={{ transform: `translateX(-50%) rotate(${hrDeg}deg)` }} />
          <div className="clock-hand min-hand" style={{ transform: `translateX(-50%) rotate(${minDeg}deg)` }} />
          <div className="clock-hand sec-hand" style={{ transform: `translateX(-50%) rotate(${secDeg}deg)` }} />
          <div className="clock-center" />
        </div>
        <p style={{color: 'white', marginTop: '15px', fontWeight: 'bold', letterSpacing: '1px'}}>
          {time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </p>
        <p style={{color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px'}}>
          {time.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
        </p>
      </div>

      <div className="sidebar-section">
        <h4 style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px'}}>Filters</h4>
        <select 
          className="auth-input" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
          style={{width: '100%'}}
        >
          <option value="All">All Tasks</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="High Priority">High Priority</option>
          <option value="Today">Today</option>
        </select>
      </div>

      <div className="sidebar-section">
        <h4 style={{color: 'rgba(255,255,255,0.7)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '10px'}}>Energy Level</h4>
        {tasks.length > 0 ? (
          <div>
            <div style={{display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '8px'}}>
              <span>Progress</span>
              <span>{Math.round((completedCount / tasks.length) * 100)}%</span>
            </div>
            <div className="energy-bar-bg">
              <div 
                className="energy-bar-fill" 
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
            <div style={{color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '8px', textAlign: 'center'}}>
              {completedCount} of {tasks.length} tasks completed
            </div>
          </div>
        ) : (
          <p style={{fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center'}}>No energy expended yet. 🌟</p>
        )}
      </div>

      <div style={{marginTop: 'auto', paddingTop: '20px'}}>
        <button
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            background: 'var(--input-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          {themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </aside>
  );
}
