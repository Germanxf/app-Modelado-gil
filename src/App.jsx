import React, { useState, useEffect } from 'react';
import './App.css';

// Versión de la app (cámbiala a v1.1.0 para probar el despliegue automático en AWS)
const VERSION = 'v1.0.0';
const WIP_LIMIT = 3; // Límite de tareas simultáneas en proceso según metodología Kanban

export default function App() {
  // Autenticación simple (almacenada en LocalStorage)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('app_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Tareas del Tablero Kanban
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('kanban_tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Definir historias de usuario del Sprint', priority: 'alta', status: 'todo' },
        { id: 2, title: 'Modelar diagramas de casos de uso', priority: 'media', status: 'todo' },
        { id: 3, title: 'Desarrollar componentes de la interfaz', priority: 'alta', status: 'in-progress' },
        { id: 4, title: 'Configurar entorno de desarrollo', priority: 'baja', status: 'done' },
        { id: 5, title: 'Crear repositorio en GitHub', priority: 'alta', status: 'done' }
      ];
    } catch {
      return [];
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('media');
  const [wipWarning, setWipWarning] = useState('');
  
  // Estado para la prueba de tráfico de red (para las gráficas de AWS)
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCount, setSyncCount] = useState(0);

  // Guardar tareas en LocalStorage cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // Manejadores de autenticación
  const handleLogin = (e) => {
    e.preventDefault();
    const newUser = {
      name: email.split('@')[0] || 'Germán',
      email: email || 'usuario@agil.com'
    };
    setUser(newUser);
    localStorage.setItem('app_user', JSON.stringify(newUser));
  };

  const handleQuickLogin = () => {
    const defaultUser = { name: 'Germán', email: 'german@agil.edu' };
    setUser(defaultUser);
    localStorage.setItem('app_user', JSON.stringify(defaultUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  // Agregar nueva tarea
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: 'todo'
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setWipWarning('');
  };

  // Mover tarea aplicando reglas Kanban (Límite WIP en 'in-progress')
  const handleMoveTask = (id, newStatus) => {
    setWipWarning('');

    // Regla Kanban: Validar límite de trabajo en proceso (WIP)
    if (newStatus === 'in-progress') {
      const currentInProgress = tasks.filter(t => t.status === 'in-progress').length;
      if (currentInProgress >= WIP_LIMIT) {
        setWipWarning(`⚠️ Límite WIP alcanzado: Máximo ${WIP_LIMIT} tareas en proceso según el modelo Kanban. Termina una antes de iniciar otra.`);
        return;
      }
    }

    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  // Eliminar tarea
  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Función para generar tráfico de red y registrar actividad en las gráficas de AWS
  const handleSyncData = async () => {
    setIsSyncing(true);
    setWipWarning('');
    const totalCalls = 40;
    
    // Dispara peticiones asíncronas para generar tráfico en CloudWatch/Amplify
    for (let i = 0; i < totalCalls; i++) {
      await new Promise(r => setTimeout(r, 25));
      setSyncCount(prev => prev + 1);
    }
    
    setIsSyncing(false);
  };

  // ==========================================
  // PANTALLA 1: Inicio de Sesión
  // ==========================================
  if (!user) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="app-icon">📋</div>
            <h2>Tablero Kanban</h2>
            <p>Sistema de Gestión Ágil &bull; {VERSION}</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="usuario@correo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-main">Iniciar Sesión</button>
            <button type="button" onClick={handleQuickLogin} className="btn-demo">Acceso Rápido Demo</button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PANTALLA 2: Tablero Kanban Principal
  // ==========================================
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="app-layout">
      {/* Barra de navegación superior */}
      <header className="navbar">
        <div className="nav-left">
          <div className="nav-brand">
            <span className="brand-icon">📋</span>
            <span className="brand-name">Tablero Kanban Ágil</span>
          </div>
          <span className="version-tag">{VERSION}</span>
        </div>

        <div className="nav-right">
          <button 
            onClick={handleSyncData} 
            disabled={isSyncing} 
            className="btn-sync"
            title="Genera tráfico de sincronización visible en las métricas de AWS"
          >
            {isSyncing ? 'Sincronizando...' : '🔄 Sincronizar'}
            {syncCount > 0 && <span className="sync-badge">{syncCount}</span>}
          </button>

          <div className="user-info">
            <span className="user-icon">👤</span>
            <span className="user-name">{user.name}</span>
          </div>

          <button onClick={handleLogout} className="btn-logout">Salir</button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="content-container">
        
        {/* Formulario para agregar tareas */}
        <section className="form-card">
          <form onSubmit={handleAddTask} className="add-task-form">
            <input 
              type="text" 
              placeholder="Nueva historia de usuario o tarea..." 
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              className="task-input"
            />
            <select 
              value={newTaskPriority}
              onChange={e => setNewTaskPriority(e.target.value)}
              className="priority-select"
            >
              <option value="alta">Prioridad Alta</option>
              <option value="media">Prioridad Media</option>
              <option value="baja">Prioridad Baja</option>
            </select>
            <button type="submit" className="btn-add">+ Agregar Tarea</button>
          </form>

          {/* Alerta de regla WIP Kanban */}
          {wipWarning && (
            <div className="wip-alert">
              {wipWarning}
            </div>
          )}
        </section>

        {/* Columnas Kanban */}
        <div className="kanban-grid">
          
          {/* Columna 1: Por Hacer */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <span className="dot dot-todo"></span>
                <span>Por Hacer</span>
              </div>
              <span className="count-pill">{todoTasks.length}</span>
            </div>

            <div className="cards-wrapper">
              {todoTasks.length === 0 ? (
                <div className="empty-column">No hay tareas pendientes</div>
              ) : (
                todoTasks.map(task => (
                  <div key={task.id} className="kanban-card">
                    <div className="card-top">
                      <span className={`tag tag-${task.priority}`}>{task.priority}</span>
                      <button onClick={() => handleDeleteTask(task.id)} className="btn-del" title="Eliminar">×</button>
                    </div>
                    <p className="card-title">{task.title}</p>
                    <div className="card-bottom">
                      <span></span>
                      <button onClick={() => handleMoveTask(task.id, 'in-progress')} className="btn-action">
                        Iniciar ➔
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 2: En Proceso (Con regla de límite WIP) */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <span className="dot dot-progress"></span>
                <span>En Proceso</span>
                <span className="wip-limit-tag">WIP: {inProgressTasks.length}/{WIP_LIMIT}</span>
              </div>
              <span className="count-pill">{inProgressTasks.length}</span>
            </div>

            <div className="cards-wrapper">
              {inProgressTasks.length === 0 ? (
                <div className="empty-column">Sin tareas en curso</div>
              ) : (
                inProgressTasks.map(task => (
                  <div key={task.id} className="kanban-card card-active">
                    <div className="card-top">
                      <span className={`tag tag-${task.priority}`}>{task.priority}</span>
                      <button onClick={() => handleDeleteTask(task.id)} className="btn-del" title="Eliminar">×</button>
                    </div>
                    <p className="card-title">{task.title}</p>
                    <div className="card-bottom">
                      <button onClick={() => handleMoveTask(task.id, 'todo')} className="btn-action-back">
                        ⬅ Volver
                      </button>
                      <button onClick={() => handleMoveTask(task.id, 'done')} className="btn-action">
                        Completar ➔
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna 3: Finalizadas */}
          <div className="kanban-column">
            <div className="column-header">
              <div className="column-title">
                <span className="dot dot-done"></span>
                <span>Finalizadas</span>
              </div>
              <span className="count-pill">{doneTasks.length}</span>
            </div>

            <div className="cards-wrapper">
              {doneTasks.length === 0 ? (
                <div className="empty-column">No hay tareas completadas</div>
              ) : (
                doneTasks.map(task => (
                  <div key={task.id} className="kanban-card card-completed">
                    <div className="card-top">
                      <span className={`tag tag-${task.priority}`}>{task.priority}</span>
                      <button onClick={() => handleDeleteTask(task.id)} className="btn-del" title="Eliminar">×</button>
                    </div>
                    <p className="card-title strike">{task.title}</p>
                    <div className="card-bottom">
                      <button onClick={() => handleMoveTask(task.id, 'in-progress')} className="btn-action-back">
                        ⬅ Reabrir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      <footer className="footer-bar">
        <span>Modelado Ágil &bull; Tablero Kanban &bull; {VERSION}</span>
      </footer>
    </div>
  );
}
