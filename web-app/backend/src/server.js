import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import inferenceRoutes from './routes/inferenceRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.development' });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/public', express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/v1', inferenceRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Global state to store whether classification is active
let globalClassificationState = false;

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`[Socket] Device connected: ${socket.id}`);

  // Send the current state to the newly connected client immediately
  socket.emit('classification_state', { active: globalClassificationState });

  socket.on('video_frame_upstream', (base64Frame) => {
    // Broadcast the frame to all connected UI clients
    socket.broadcast.emit('video_frame_downstream', base64Frame);
  });

  socket.on('set_classification_state', (data) => {
    if (typeof data.active === 'boolean') {
      globalClassificationState = data.active;
      // Broadcast the new state to ALL clients (UI and Firmware)
      io.emit('classification_state', { active: globalClassificationState });
      console.log(`[Socket] Classification state changed to: ${globalClassificationState}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Device disconnected: ${socket.id}`);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 Backend server running on port ${PORT}`);
  console.log(`📋 Routes: /api/health | /api/v1/stats | /api/v1/telemetry | /api/v1/inferences | /api/v1/yield-trend`);
  console.log(`⚡ WebSocket Server running and listening for frames`);
});
