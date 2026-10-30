// Estado y configuración
let selectedTrafficCount = 60;
let requestRatesHistory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let lastTotalRequests = 0;

// Elementos del DOM
const healthPill = document.getElementById('healthPill');
const healthText = document.getElementById('healthText');
const uptimeDisplay = document.getElementById('uptimeDisplay');
const cpuModelEl = document.getElementById('cpuModel');
const cpuCoresEl = document.getElementById('cpuCores');
const memoryUsedEl = document.getElementById('memoryUsed');
const memoryTotalEl = document.getElementById('memoryTotal');
const totalRequestsEl = document.getElementById('totalRequests');
const awsEnvironmentEl = document.getElementById('awsEnvironment');
const awsRegionEl = document.getElementById('awsRegion');

const btnStressCpu = document.getElementById('btnStressCpu');
const btnSendTraffic = document.getElementById('btnSendTraffic');
const trafficProgress = document.getElementById('trafficProgress');
const progressFill = trafficProgress.querySelector('.progress-fill');
const btnSlowReq = document.getElementById('btnSlowReq');
const slowResultText = document.getElementById('slowResultText');
const statusCodeResult = document.getElementById('statusCodeResult');
const historyList = document.getElementById('historyList');
const btnClearHistory = document.getElementById('btnClearHistory');
const btnVerGuia = document.getElementById('btnVerGuia');

// Inicializar Canvas para Gráfica en tiempo real
const canvas = document.getElementById('realtimeChart');
const ctx = canvas.getContext('2d');

// 1. Cargar y renderizar historial de LocalStorage
function loadLocalStorageEvents() {
  try {
    const raw = localStorage.getItem('aws_monitor_events');
    const events = raw ? JSON.parse(raw) : [];
    renderHistory(events);
  } catch (e) {
    console.error('Error al leer LocalStorage', e);
  }
}

function saveLocalEvent(type, message, category = 'info') {
  try {
    const raw = localStorage.getItem('aws_monitor_events');
    const events = raw ? JSON.parse(raw) : [];
    const newEvent = {
      id: Date.now(),
      type,
      message,
      category,
      time: new Date().toLocaleTimeString()
    };
    events.unshift(newEvent);
    // Guardar máximo 20 eventos
    const trimmed = events.slice(0, 20);
    localStorage.setItem('aws_monitor_events', JSON.stringify(trimmed));
    renderHistory(trimmed);
  } catch (e) {
    console.error('Error al guardar en LocalStorage', e);
  }
}

function renderHistory(events) {
  if (!events || events.length === 0) {
    historyList.innerHTML = '<div class="empty-state">No hay eventos aún. Haz clic en los botones de carga arriba.</div>';
    return;
  }
  historyList.innerHTML = events.map(ev => `
    <div class="history-item ${ev.category}">
      <div>
        <strong>${ev.type}:</strong> ${ev.message}
      </div>
      <span style="color: var(--text-dim); font-size: 0.7rem;">${ev.time}</span>
    </div>
  `).join('');
}

btnClearHistory.addEventListener('click', () => {
  localStorage.removeItem('aws_monitor_events');
  renderHistory([]);
});

// 2. Polling de Métricas del Servidor (Health y Telemetría)
async function fetchMetrics() {
  try {
    const res = await fetch('/api/metrics');
    if (!res.ok) throw new Error('Servidor offline');
    const data = await res.json();

    // Actualizar salud
    healthPill.style.background = 'rgba(16, 185, 129, 0.1)';
    healthPill.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    healthText.textContent = 'Saludable (200 OK)';

    // Formatear Uptime
    const secs = data.server.uptimeSeconds;
    const hrs = String(Math.floor(secs / 3600)).padStart(2, '0');
    const mins = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    uptimeDisplay.textContent = `${hrs}:${mins}:${s}`;

    // Datos del Host y CPU
    cpuModelEl.textContent = data.server.architecture.toUpperCase() + ' Host';
    cpuCoresEl.textContent = `${data.server.cpuCount} Cores | ${data.server.platform.toUpperCase()} (${data.server.hostname})`;

    // Memoria
    memoryUsedEl.textContent = `${data.server.processMemoryMB.rss} MB`;
    memoryTotalEl.textContent = `Heap: ${data.server.processMemoryMB.heapUsed}MB / Host: ${data.server.totalMemoryMB}MB`;

    // Contador de solicitudes
    const currentTotal = data.metrics.totalRequestsServed;
    totalRequestsEl.textContent = currentTotal.toLocaleString();

    // Calcular delta para la gráfica
    if (lastTotalRequests > 0) {
      const delta = Math.max(0, currentTotal - lastTotalRequests);
      requestRatesHistory.push(delta);
      requestRatesHistory.shift();
    }
    lastTotalRequests = currentTotal;

    // Entorno AWS
    awsEnvironmentEl.textContent = `Puerto :${data.awsInfo.port}`;
    awsRegionEl.textContent = `Host: ${data.awsInfo.awsRegion}`;

    drawRealtimeChart();

  } catch (err) {
    healthPill.style.background = 'rgba(244, 63, 94, 0.1)';
    healthPill.style.borderColor = 'rgba(244, 63, 94, 0.3)';
    healthText.textContent = 'Sin respuesta del servidor';
  }
}

// 3. Dibujar Gráfica Suave en Canvas
function drawRealtimeChart() {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  // Líneas de guía horizontal
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const y = (height / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const maxVal = Math.max(10, ...requestRatesHistory);
  const step = width / (requestRatesHistory.length - 1);

  // Relleno de gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
  gradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.beginPath();
  ctx.moveTo(0, height);
  requestRatesHistory.forEach((val, idx) => {
    const x = idx * step;
    const y = height - (val / maxVal) * (height - 20) - 10;
    if (idx === 0) ctx.lineTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Línea principal
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  requestRatesHistory.forEach((val, idx) => {
    const x = idx * step;
    const y = height - (val / maxVal) * (height - 20) - 10;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Puntos clave
  requestRatesHistory.forEach((val, idx) => {
    const x = idx * step;
    const y = height - (val / maxVal) * (height - 20) - 10;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
}

// 4. Selector de cantidad de tráfico
document.querySelectorAll('.btn-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.btn-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedTrafficCount = parseInt(chip.dataset.count, 10);
  });
});

// 5. Acción: Enviar Ráfaga de Tráfico
btnSendTraffic.addEventListener('click', async () => {
  const count = selectedTrafficCount;
  btnSendTraffic.disabled = true;
  trafficProgress.classList.remove('hidden');
  progressFill.style.width = '0%';

  saveLocalEvent('Ráfaga Tráfico', `Iniciando envío de ${count} peticiones simultáneas`, 'info');

  let completed = 0;
  const promises = [];

  for (let i = 0; i < count; i++) {
    const p = fetch('/api/ping')
      .then(() => {
        completed++;
        progressFill.style.width = `${Math.round((completed / count) * 100)}%`;
      })
      .catch(() => {});
    promises.push(p);
  }

  await Promise.all(promises);

  setTimeout(() => {
    trafficProgress.classList.add('hidden');
    btnSendTraffic.disabled = false;
    saveLocalEvent('Ráfaga Completada', `${count} peticiones entregadas con éxito a AWS`, 'info');
    fetchMetrics();
  }, 400);
});

// 6. Acción: Estrés de CPU
btnStressCpu.addEventListener('click', async () => {
  const spinner = btnStressCpu.querySelector('.btn-spinner');
  const text = btnStressCpu.querySelector('.btn-text');
  
  btnStressCpu.disabled = true;
  spinner.classList.remove('hidden');
  text.textContent = 'Calculando estrés...';

  saveLocalEvent('Estrés CPU', 'Ejecutando bucle matemático intensivo (3500ms)', 'warning');

  try {
    const res = await fetch('/api/stress-cpu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ durationMs: 3500 })
    });
    const data = await res.json();
    saveLocalEvent('CPU Carga OK', `${data.iterations.toLocaleString()} iteraciones en ${data.durationMs}ms`, 'warning');
  } catch (err) {
    saveLocalEvent('Error CPU', 'Fallo al disparar estrés', 'danger');
  } finally {
    spinner.classList.add('hidden');
    text.textContent = 'Disparar Carga de CPU';
    btnStressCpu.disabled = false;
    fetchMetrics();
  }
});

// 7. Acción: Probar Latencia
btnSlowReq.addEventListener('click', async () => {
  const spinner = btnSlowReq.querySelector('.btn-spinner');
  const text = btnSlowReq.querySelector('.btn-text');

  btnSlowReq.disabled = true;
  spinner.classList.remove('hidden');
  text.textContent = 'Esperando delay...';

  const t0 = performance.now();
  try {
    const res = await fetch('/api/slow?delay=800');
    await res.json();
    const duration = Math.round(performance.now() - t0);
    slowResultText.textContent = `Latencia registrada: ${duration}ms`;
    saveLocalEvent('Test Latencia', `Demora controlada de ${duration}ms en respuesta`, 'info');
  } catch (err) {
    slowResultText.textContent = 'Error al probar latencia';
  } finally {
    spinner.classList.add('hidden');
    text.textContent = 'Probar Latencia';
    btnSlowReq.disabled = false;
    fetchMetrics();
  }
});

// 8. Acción: Probar Estados HTTP
document.querySelectorAll('.btn-mini').forEach(btn => {
  btn.addEventListener('click', async () => {
    const code = btn.dataset.status;
    try {
      const res = await fetch(`/api/status-code/${code}`);
      const data = await res.json();
      statusCodeResult.textContent = `Respuesta recibida: ${data.statusCode} (${code === '200' ? 'OK' : 'Simulado'})`;
      
      const category = code === '200' ? 'info' : (code === '404' ? 'warning' : 'danger');
      saveLocalEvent(`Estado HTTP ${code}`, data.description, category);
      fetchMetrics();
    } catch (err) {
      statusCodeResult.textContent = `Error de red al llamar /api/status-code/${code}`;
    }
  });
});

// 9. Botón Guía Explicación
btnVerGuia.addEventListener('click', () => {
  const guia = document.getElementById('guiaExplicacion');
  guia.scrollIntoView({ behavior: 'smooth' });
  guia.style.boxShadow = '0 0 30px rgba(255, 153, 0, 0.4)';
  setTimeout(() => {
    guia.style.boxShadow = '';
  }, 2000);
});

// Inicialización
loadLocalStorageEvents();
fetchMetrics();
setInterval(fetchMetrics, 2000);
