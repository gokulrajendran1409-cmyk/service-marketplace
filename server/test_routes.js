const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('OK');
});

server.listen(3000, () => {
    console.log('Test server on 3000');
});

// Test requiring professionalRoutes
try {
    const professionalRoutes = require('./server/routes/professionalRoutes');
    console.log('professionalRoutes loaded successfully');
    console.log('Router type:', typeof professionalRoutes);
} catch(e) {
    console.error('Error loading professionalRoutes:', e.message);
}

process.exit(0);