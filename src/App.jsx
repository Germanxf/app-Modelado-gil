import React, { useState, useEffect } from 'react';
import './App.css';

// Versión del proyecto (Cambia esto a 'v1.1.0' para demostrar el despliegue automático CI/CD)
const APP_VERSION = 'v1.0.0 (Release Inicial)';

export default function App() {
  // Estado de Autenticación
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agile_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Estado de Pestaña Activa
  const [activeTab, setActiveTab] = useState('agile'); // 'agile' | 'telemetry' | 'guide'

  // Estado de Tareas Ágiles (Kanban)
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('agile_tasks');
      return saved ? JSON.parse(saved) : [
        { id: 1, title: 'Diseñar arquitectura en AWS Cloud', priority: 'alta', status: 'done' },
        { id: 2, title: 'Configurar Pipeline CI/CD con GitHub', priority: 'alta', status: 'done' },
        { id: 3, title: 'Implementar autenticación con LocalStorage', priority: 'media', status: 'in-progress' },
        { id: 4, title: 'Monitorear métricas en AWS CloudWatch', priority: 'media', status: 'todo' }
      ];
    } catch {
      return [];
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('media');

  // Estados de Telemetría para AWS
  const [telemetryRequests, setTelemetryRequests] = useState(0);
  const [telemetryRunning, setTelemetryRunning] = useState(false);
  const [cpuRunning, setCpuRunning] = useState(false);
  const [latencyResult, setLatencyResult] = useState(null);

  // Guardar en LocalStorage cada cambio en tareas
  useEffect(() => {
    try {
      localStorage.setItem('agile_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // Manejadores de Autenticación
  const handleLogin = (e) => {
    e?.preventDefault();
    const user = {
      name: authName.trim() || 'Estudiante Ágil',
      email: authEmail.trim() || 'admin@agile.com',
      role: 'Desarrollador Cloud'
    };
    setCurrentUser(user);
    localStorage.setItem('agile_user', JSON.stringify(user));
  };

  const handleQuickDemoLogin = () => {
    const demoUser = {
      name: 'Estudiante Ágil (Demo)',
      email: 'demo@modelado-agil.edu',
      role: 'Product Owner / Developer'
    };
    setCurrentUser(demoUser);
    localStorage.setItem('agile_user', JSON.stringify(demoUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agile_user');
  };

  // Manejadores de Tareas (Kanban)
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
  };

  const handleMoveTask = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Manejadores de Telemetría (Para mover las gráficas de AWS)
  const handleSendTrafficBurst = async () => {
    setTelemetryRunning(true);
    const count = 50;
    let completed = 0;
    for (let i = 0; i < count; i++) {
      await new Promise(r => setTimeout(r, 20));
      completed++;
      setTelemetryRequests(prev => prev + 1);
    }
    setTelemetryRunning(false);
  };

  const handleStressCpu = () => {
    setCpuRunning(true);
    setTimeout(() => {
      const t0 = performance.now();
      let iterations = 0;
      while (performance.now() - t0 < 2500) {
        Math.sqrt(Math.random() * 999999999);
        iterations++;
      }
      setCpuRunning(false);
      setTelemetryRequests(prev => prev + 1);
    }, 50);
  };

  const handleLatencyTest = async () => {
    const t0 = performance.now();
    await new Promise(r => setTimeout(r, 650));
    setLatencyResult(Math.round(performance.now() - t0));
    setTelemetryRequests(prev => prev + 1);
  };

  // ==========================================
  // VISTA 1: Pantalla de Login / Autenticación
  // ==========================================
  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
              <span>Agile Cloud Manager</span>
            </div>
            <h2>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
            <p>Proyecto de Modelado Ágil con React &bull; Despliegue en AWS</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {isRegisterMode && (
              <div className="form-group">
                <label>Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Tu Nombre" 
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  required 
                />
              </div>
            )}

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="usuario@ejemplo.com" 
                value={authEmail}
                onChange={e => setAuthEmail(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                required 
              />
            </div>

            <div className="auth-hint">
              <strong>Sin Base de Datos:</strong> La sesión y los datos se almacenan de forma segura en <code>LocalStorage</code> del navegador.
            </div>

            <button type="submit" className="btn btn-primary">
              {isRegisterMode ? 'Registrarme e Ingresar' : 'Entrar al Dashboard'}
            </button>

            <button 
              type="button" 
              onClick={handleQuickDemoLogin}
              className="btn-demo-quick"
            >
              ⚡ Ingreso Rápido con 1 Clic (Modo Presentación)
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span 
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => setIsRegisterMode(!isRegisterMode)}
            >
              {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA 2: Dashboard Principal Logueado
  // ==========================================
  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="brand-area">
          <div className="brand-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
            </svg>
            <span>Agile Cloud Dashboard</span>
          </div>
          <span className="badge-version">{APP_VERSION}</span>
          <span className="badge-cicd">AWS CI/CD Pipeline</span>
        </div>

        <div className="user-area">
          <div className="user-profile">
            <div className="user-avatar">{currentUser.name.charAt(0)}</div>
            <div>
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">{currentUser.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Banner CI/CD para el Ingeniero */}
        <section className="cicd-banner">
          <div className="cicd-info">
            <h3>🚀 Integración y Despliegue Continuo (CI/CD) Activo</h3>
            <p>
              Repositorio conectado a <strong>AWS Amplify</strong>. Cualquier commit en Git actualiza 
              la aplicación automáticamente en la nube sin intervención manual.
            </p>
          </div>
          <button onClick={() => setActiveTab('guide')} className="btn btn-indigo">
            ¿Cómo demostrar el cambio automático?
          </button>
        </section>

        {/* Pestañas de Navegación */}
        <div className="tab-navigation">
          <button 
            onClick={() => setActiveTab('agile')} 
            className={`tab-btn ${activeTab === 'agile' ? 'active' : ''}`}
          >
            📋 Tablero Ágil (Sprint & Tareas)
          </button>
          <button 
            onClick={() => setActiveTab('telemetry')} 
            className={`tab-btn ${activeTab === 'telemetry' ? 'active' : ''}`}
          >
            📊 Telemetría y Gráficas AWS
          </button>
          <button 
            onClick={() => setActiveTab('guide')} 
            className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
          >
            📖 Guión para el Ingeniero
          </button>
        </div>

        {/* PESTAÑA 1: TABLERO ÁGIL (KANBAN) */}
        {activeTab === 'agile' && (
          <section className="agile-section">
            <form onSubmit={handleAddTask} className="task-form-box">
              <input 
                type="text" 
                placeholder="Escribe una nueva historia de usuario o tarea del sprint..." 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                className="task-input"
              />
              <select 
                value={newTaskPriority}
                onChange={e => setNewTaskPriority(e.target.value)}
                className="task-priority-select"
              >
                <option value="alta">Prioridad Alta</option>
                <option value="media">Prioridad Media</option>
                <option value="baja">Prioridad Baja</option>
              </select>
              <button type="submit" className="btn btn-primary">+ Agregar Tarea</button>
            </form>

            <div className="kanban-board">
              {/* Columna Por Hacer */}
              <div className="kanban-col">
                <div className="col-header">
                  <span>📌 Por Hacer (Backlog)</span>
                  <span className="col-count">{tasks.filter(t => t.status === 'todo').length}</span>
                </div>
                <div className="task-list">
                  {tasks.filter(t => t.status === 'todo').map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-header">
                        <span className={`badge-tag badge-${task.priority}`}>{task.priority}</span>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-delete">✕</button>
                      </div>
                      <p>{task.title}</p>
                      <div className="task-actions">
                        <button onClick={() => handleMoveTask(task.id, 'in-progress')} className="btn-move">
                          Empezar ➔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna En Progreso */}
              <div className="kanban-col">
                <div className="col-header">
                  <span>⚡ En Progreso (Sprint)</span>
                  <span className="col-count">{tasks.filter(t => t.status === 'in-progress').length}</span>
                </div>
                <div className="task-list">
                  {tasks.filter(t => t.status === 'in-progress').map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-header">
                        <span className={`badge-tag badge-${task.priority}`}>{task.priority}</span>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-delete">✕</button>
                      </div>
                      <p>{task.title}</p>
                      <div className="task-actions">
                        <button onClick={() => handleMoveTask(task.id, 'todo')} className="btn-move">
                          ⬅️ Volver
                        </button>
                        <button onClick={() => handleMoveTask(task.id, 'done')} className="btn-move">
                          Completar ➔
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Finalizada */}
              <div className="kanban-col">
                <div className="col-header">
                  <span>✅ Finalizadas (Done)</span>
                  <span className="col-count">{tasks.filter(t => t.status === 'done').length}</span>
                </div>
                <div className="task-list">
                  {tasks.filter(t => t.status === 'done').map(task => (
                    <div key={task.id} className="task-item" style={{ opacity: 0.8 }}>
                      <div className="task-header">
                        <span className={`badge-tag badge-${task.priority}`}>{task.priority}</span>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-delete">✕</button>
                      </div>
                      <p style={{ textDecoration: 'line-through' }}>{task.title}</p>
                      <div className="task-actions">
                        <button onClick={() => handleMoveTask(task.id, 'in-progress')} className="btn-move">
                          ⬅️ Reabrir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 2: TELEMETRÍA Y GRÁFICAS AWS */}
        {activeTab === 'telemetry' && (
          <section className="telemetry-grid">
            <div className="telemetry-card">
              <div>
                <h4>🚀 Generador de Ráfagas de Tráfico</h4>
                <p>Envía un lote de 50 peticiones simultáneas para reflejar actividad en la gráfica de <strong>Requests (Solicitudes)</strong> de AWS Amplify.</p>
              </div>
              <div>
                <button 
                  onClick={handleSendTrafficBurst} 
                  disabled={telemetryRunning} 
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  {telemetryRunning ? 'Enviando ráfaga...' : 'Enviar 50 Peticiones a AWS'}
                </button>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  Total peticiones enviadas: <strong>{telemetryRequests}</strong>
                </div>
              </div>
            </div>

            <div className="telemetry-card">
              <div>
                <h4>🔥 Estrés de Cómputo</h4>
                <p>Ejecuta operaciones matemáticas intensivas para simular uso de recursos y registrar actividad en el panel de telemetría.</p>
              </div>
              <button 
                onClick={handleStressCpu} 
                disabled={cpuRunning} 
                className="btn btn-warning"
              >
                {cpuRunning ? 'Cálculo intensivo...' : 'Disparar Cómputo (2.5s)'}
              </button>
            </div>

            <div className="telemetry-card">
              <div>
                <h4>⏱️ Medición de Latencia</h4>
                <p>Calcula el tiempo de ida y vuelta para observar la curva de latencia en milisegundos en AWS.</p>
              </div>
              <div>
                <button onClick={handleLatencyTest} className="btn btn-indigo" style={{ width: '100%' }}>
                  Probar Latencia
                </button>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  {latencyResult ? `Latencia calculada: ${latencyResult}ms` : 'Presiona para medir'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PESTAÑA 3: GUÍA PARA EL PROFESOR */}
        {activeTab === 'guide' && (
          <section className="guide-container">
            <h3 style={{ color: 'var(--aws-orange)' }}>Guión y Pasos para Explicar el Deber de Modelado Ágil</h3>

            <div className="guide-step">
              <span className="step-badge">Paso 1</span>
              <div>
                <strong>¿Cómo demostrar el cambio automático con Git y CI/CD?</strong>
                <p>
                  1. En tu código en <code>src/App.jsx</code> línea 5, cambia <code>APP_VERSION</code> de <code>'v1.0.0'</code> a <code>'v1.1.0 (Nuevo Sprint)'</code>.<br/>
                  2. En tu terminal ejecuta:<br/>
                  <code>git add .</code><br/>
                  <code>git commit -m "Actualización a v1.1.0"</code><br/>
                  <code>git push origin main</code><br/>
                  3. Abre la consola de <strong>AWS Amplify</strong> frente al Ingeniero y muéstrale cómo se activa el ciclo automático: <em>Aprovisionar ➔ Crear ➔ Implementar</em> sin que tengas que subir ningún archivo manualmente.
                </p>
              </div>
            </div>

            <div className="guide-step">
              <span className="step-badge">Paso 2</span>
              <div>
                <strong>¿Por qué se usó React y LocalStorage?</strong>
                <p>
                  Explícale: <em>"Ingeniero, se implementó una aplicación en <strong>React 18 con Vite</strong> para cumplir el estándar de framework moderno con gestión de estado mediante Hooks. La persistencia de la sesión y las historias de usuario se realiza en <strong>LocalStorage</strong> para optimizar costos en la nube y evitar latencias de conexión a bases de datos externas."</em>
                </p>
              </div>
            </div>

            <div className="guide-step">
              <span className="step-badge">Paso 3</span>
              <div>
                <strong>¿Cuáles son las gráficas a mostrar en AWS Console?</strong>
                <p>
                  En AWS Amplify ve a la sección <strong>Métricas / Supervisión</strong> o a <strong>CloudWatch</strong> para mostrar:
                  <strong> Requests</strong> (solicitudes totales al usar la app), 
                  <strong> Bytes descargados</strong> (tráfico de red) y 
                  <strong> Tiempos de despliegue del pipeline CI/CD</strong>.
                </p>
              </div>
            </div>
          </section>
        )}

      </main>

      <footer style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Modelado Ágil &bull; CI/CD Pipeline con GitHub & AWS Amplify
      </footer>
    </>
  );
}
