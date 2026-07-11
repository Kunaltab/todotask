import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, LogOut } from 'lucide-react';

const quotes = [
  "Once you've met someone you never really forget them. - Spirited Away",
  "A heart's a heavy burden. - Howl's Moving Castle",
  "No matter how many weapons you have, you cannot live without love. - Castle in the Sky",
  "Always believe in yourself. Do this and no matter where you are, you will have nothing to fear. - The Cat Returns",
  "We each need to find our own inspiration. Sometimes it's not easy. - Kiki's Delivery Service"
];

export default function Dashboard() {
  const { token, setToken, user } = useContext(AppContext);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  // New Task & Planner State
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', category: 'Learning', day: todayName });
  const [quote, setQuote] = useState("");

  useEffect(() => {
    fetchTasks();
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setNewTask({ title: '', description: '', priority: 'Medium', category: 'Learning', day: selectedDay });
        setShowAdd(false);
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setToken(null);
  };

  // Filtering
  let filtered = [...tasks];
  if (filterType === 'Completed') filtered = filtered.filter(t => t.completed);
  else if (filterType === 'Pending') filtered = filtered.filter(t => !t.completed);
  else if (filterType === 'High Priority') filtered = filtered.filter(t => t.priority === 'High');
  else if (filterType === 'Today') {
    const todayStr = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(t => t.created_at && t.created_at.startsWith(todayStr));
  }
  
  // Apply Day filter
  filtered = filtered.filter(t => t.day === selectedDay || (!t.day && selectedDay === todayName));

  if (search) {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }

  return (
    <div className="dashboard">
      <Sidebar 
        tasks={tasks} 
        filterType={filterType} 
        setFilterType={setFilterType} 
      />
      
      <main className="main-content glass">
        <header className="dash-header">
          <div>
            <h2>Hello, {user ? user.username : 'Traveler'} ✨</h2>
            <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '14px', marginTop: '5px'}}>What magic will you create today?</p>
          </div>
          <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
            <div className="search-bar">
              <Search size={18} color="rgba(255,255,255,0.5)" />
              <input 
                type="text" 
                placeholder="Search quests..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="icon-btn" onClick={handleLogout} style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <motion.div 
          className="quote-container"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
        >
          <p className="quote-text">"{quote}"</p>
        </motion.div>

        <AnimatePresence>
          {showAdd && (
            <motion.form 
              className="add-task-form glass"
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 20 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              onSubmit={handleAddTask}
              style={{ overflow: 'hidden' }}
            >
              <div style={{padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <input type="text" placeholder="Task Title" className="auth-input" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                <input type="text" placeholder="Description (Optional)" className="auth-input" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
                
                <div style={{display: 'flex', gap: '15px'}}>
                  <select className="auth-input" value={newTask.day} onChange={e => setNewTask({...newTask, day: e.target.value})}>
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="auth-input" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                  <select className="auth-input" value={newTask.category} onChange={e => setNewTask({...newTask, category: e.target.value})}>
                    <option value="Learning">📚 Learning</option>
                    <option value="Coding">💻 Coding</option>
                    <option value="Health">🏃 Health</option>
                    <option value="Personal">🏠 Personal</option>
                    <option value="Work">💼 Work</option>
                  </select>
                  <button type="submit" className="auth-btn" style={{flex: 1}}>Save Task</button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="bento-container">
          {daysOfWeek.map(day => {
            const isActive = selectedDay === day;
            const isActualToday = day === todayName;
            
            const dayTasksCount = tasks.filter(t => t.day === day).length;
            const completedDayTasks = tasks.filter(t => t.day === day && t.completed).length;

            return (
              <div 
                key={day} 
                className={`bento-card ${isActive ? 'bento-today' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <div>
                  <div className="bento-title">{day}</div>
                  <div className="bento-subtitle">
                    {isActualToday ? '✨ Today' : `${completedDayTasks} / ${dayTasksCount} Tasks`}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden', marginTop: '20px' }}
                    >
                      <div className="task-list">
                        {filtered.length === 0 ? (
                          <motion.p initial={{opacity: 0}} animate={{opacity: 1}} style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px'}}>
                            No tasks found. Enjoy the peace! 🍃
                          </motion.p>
                        ) : (
                          filtered.map(task => (
                            <TaskCard key={task.id} task={task} fetchTasks={fetchTasks} token={token} />
                          ))
                        )}
                        <div 
                          style={{marginTop: '15px', padding: '15px', background: 'var(--input-bg)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-main)', border: '1px solid var(--glass-border)'}}
                          onClick={(e) => {
                             e.stopPropagation(); 
                             setNewTask({...newTask, day: day, title: '', description: ''});
                             setShowAdd(true);
                          }}
                        >
                          + Add Task for {day}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        
        <div className="fab-container">
          <div className="fab-btn" onClick={() => {
              setNewTask({...newTask, day: selectedDay, title: '', description: ''});
              setShowAdd(!showAdd);
          }}>
            <Plus size={24} />
          </div>
        </div>
      </main>
    </div>
  );
}
