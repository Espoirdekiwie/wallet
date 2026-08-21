/**
 * server.js
 * 
 * Simple Express server for serving EtherVault application
 * Provides development server with proper MIME types
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        // Set proper MIME types
        if (path.endsWith('.js')) {
            res.set('Content-Type', 'application/javascript');
        } else if (path.endsWith('.css')) {
            res.set('Content-Type', 'text/css');
        } else if (path.endsWith('.json')) {
            res.set('Content-Type', 'application/json');
        } else if (path.endsWith('.html')) {
            res.set('Content-Type', 'text/html');
        }
    }
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/pages/:page', (req, res) => {
    const pageName = req.params.page.endsWith('.html') ? req.params.page : `${req.params.page}.html`;
    res.sendFile(path.join(__dirname, 'pages', pageName));
});

// Health check endpoint (useful for deployment)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}` 
    });
});

// Start server with fallback port handling
const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║         🔐 EtherVault - Ethereum Wallet Server          ║
║                                                          ║
║         Server running on http://localhost:${PORT}              ║
║                                                          ║
║         Press Ctrl+C to stop the server                 ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
    console.log('✓ Server started successfully');
    console.log(`✓ Open your browser and navigate to http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`\n⚠️ Port ${PORT} is already in use by an active EtherVault server.`);
        console.log(`✓ Access your application directly at http://localhost:${PORT}\n`);
    } else {
        console.error('✗ Server Error:', err);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n✓ Server shutting down gracefully...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('✗ Uncaught Exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
