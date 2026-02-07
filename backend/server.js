import app from './app.js';
import connect from './db/db.js';
import http from 'http';

const PORT = process.env.PORT || 3000;

connect();

const server = http.createServer(app);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));