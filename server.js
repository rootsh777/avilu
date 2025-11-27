// server.js
// Importa los módulos necesarios
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Crea una instancia de la aplicación Express
const app = express();
const http = require('http');
// Creamos un servidor HTTP a partir del app para usar con socket.io
const server = http.createServer(app);

// Puerto configurable desde variable de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON en el body de las peticiones
app.use(express.json());

// Middleware para servir los archivos estáticos (HTML, CSS, JS) de la carpeta 'public'
// Esto es clave para que encuentre tu index.html, chefs.html, gracias.html, etc.
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para enviar mensajes a Telegram de forma segura
app.post('/api/send-message', async (req, res) => {
    // Legacy root server.js - the real server is now in `lib/server.js`
    // To start the server use `npm run start-server` which runs `node ./lib/server.js`

    console.warn('server.js in project root is deprecated. Use npm run start-server (node ./lib/server.js).');
