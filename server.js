import express from 'express';
import cors from 'cors';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Servir la build estática de React desde /dist
app.use(express.static(path.join(__dirname, 'dist')));

// Endpoint de salud (Fundamental para Application Load Balancers y Elastic Beanstalk)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    framework: 'React 18 + Vite',
    storage: 'LocalStorage (Zero-DB)',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de telemetría del servidor
app.get('/api/metrics', (req, res) => {
  res.json({
    uptime: Math.floor(process.uptime()),
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    memoryMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    port: PORT
  });
});

// Endpoint SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor React + AWS iniciado en puerto ${PORT}`);
  console.log(`📡 URL local: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
