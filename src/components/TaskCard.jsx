import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit3, Clock } from 'lucide-react';

export default function TaskCard({ task, fetchTasks, token }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(task);

  const toggleComplete = async () => {
    if (!task.completed) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500); // 500ms animation
    }

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !task.completed })
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editData.title,
          description: editData.description,
          priority: editData.priority,
          category: editData.category
        })
      });
      setIsEditing(false);
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`task ${isAnimating ? 'task-complete-anim' : ''}`}
        style={{
          background: 'var(--glass-bg)',
          padding: '20px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px',
          border: '1px solid var(--glass-border)',
          borderLeft: `4px solid ${task.priority === 'High' ? '#f87171' : task.priority === 'Medium' ? '#fbbf24' : '#4ade80'}`,
          boxShadow: '0 4px 15px var(--glass-shadow)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: `2px solid ${task.completed ? '#4ade80' : 'var(--text-muted)'}`,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer',
            background: task.completed ? '#4ade80' : 'transparent',
            transition: '0.3s'
          }} onClick={toggleComplete}>
            {task.completed && <span style={{color: 'var(--text-main)', fontSize: '14px'}}>✓</span>}
          </div>
          <div>
            <h4 style={{ 
              margin: '0 0 5px 0', 
              color: 'var(--text-main)',
              fontSize: '16px',
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.5 : 1
            }}>
              {task.title}
            </h4>
            {task.description && (
              <p style={{ 
                margin: '0 0 10px 0', 
                color: 'var(--text-muted)', 
                fontSize: '14px',
                textDecoration: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.5 : 1
              }}>
                {task.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
              <span style={{ background: 'var(--glass-border)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-main)' }}>
                {task.priority}
              </span>
              <span style={{ background: 'var(--glass-border)', padding: '4px 10px', borderRadius: '12px', color: 'var(--text-main)' }}>
                {task.category}
              </span>
              {task.created_at && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                  <Clock size={12} /> {task.created_at.split('T')[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setIsEditing(true)} className="icon-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Edit3 size={18} />
          </button>
          <button onClick={handleDelete} className="icon-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <Trash2 size={18} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
            }}
          >
            <motion.div 
              className="glass"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{ width: '400px', padding: '30px', borderRadius: '20px', background: 'var(--main-bg)', border: '1px solid var(--glass-border)' }}
            >
              <h3 style={{ color: 'var(--text-main)', marginBottom: '20px' }}>Edit Task</h3>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" className="auth-input" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} required />
                <input type="text" className="auth-input" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
                <select className="auth-input" value={editData.priority} onChange={e => setEditData({...editData, priority: e.target.value})}>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <select className="auth-input" value={editData.category} onChange={e => setEditData({...editData, category: e.target.value})}>
                  <option value="Learning">📚 Learning</option>
                  <option value="Coding">💻 Coding</option>
                  <option value="Health">🏃 Health</option>
                  <option value="Personal">🏠 Personal</option>
                  <option value="Work">💼 Work</option>
                </select>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="auth-btn" style={{ flex: 1 }}>Save</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="auth-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
