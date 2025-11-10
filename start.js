const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Leave Management System...\n');

let nexaProcess = null;
let serverProcess = null;
let botStartupTimeout = null;

function startBot() {
  console.log('📱 Starting WhatsApp Bot...');
  
  nexaProcess = spawn('node', ['nexa.js'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: __dirname,
    detached: false
  });

  nexaProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  nexaProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  nexaProcess.on('error', (err) => {
    console.error('❌ WhatsApp bot failed to start:', err.message);
    console.log('⚠️  Bot will continue in background...\n');
  });

  nexaProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`⚠️  WhatsApp bot exited with code ${code}`);
      console.log('⚠️  Bot will continue in background...\n');
    }
  });
}

function startServer() {
  console.log('🌐 Starting Web Dashboard...');
  
  serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: __dirname
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Error starting server.js:', err);
    process.exit(1);
  });

  serverProcess.on('exit', (code) => {
    console.log(`⚠️  server.js exited with code ${code}`);
    if (nexaProcess) {
      try {
        nexaProcess.kill();
      } catch (e) {}
    }
    process.exit(code || 0);
  });
}

try {
  startBot();
  
  botStartupTimeout = setTimeout(() => {
    startServer();
  }, 5000);
  
} catch (err) {
  console.error('❌ Startup error:', err.message);
  console.log('⚠️  Starting web dashboard only...\n');
  startServer();
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (botStartupTimeout) clearTimeout(botStartupTimeout);
  if (nexaProcess) {
    try {
      nexaProcess.kill();
    } catch (e) {}
  }
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  if (botStartupTimeout) clearTimeout(botStartupTimeout);
  if (nexaProcess) {
    try {
      nexaProcess.kill();
    } catch (e) {}
  }
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {}
  }
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection:', reason);
});
