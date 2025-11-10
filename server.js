const express = require('express');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessions = {};
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error('\n⚠️  SECURITY WARNING: Using default credentials!');
  console.error('   ADMIN_USERNAME: admin');
  console.error('   ADMIN_PASSWORD: admin123');
  console.error('\n   For production, set these in Replit Secrets:');
  console.error('   1. Click "Tools" → "Secrets"');
  console.error('   2. Add ADMIN_USERNAME and ADMIN_PASSWORD');
  console.error('   3. Restart the application\n');
}

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] || req.query.session;
  if (sessionId && sessions[sessionId]) {
    req.session = sessions[sessionId];
  } else {
    req.session = { id: null };
  }
  next();
});

const nexaDBDir = path.join(__dirname, 'nexaDB');
if (!fs.existsSync(nexaDBDir)) {
  fs.mkdirSync(nexaDBDir, { recursive: true });
}

const leaveDBPath = path.join(nexaDBDir, 'leave.json');

function loadLeaveDB() {
  const defaultDB = { fullLeaves: [], halfLeaves: [] };
  
  if (!fs.existsSync(leaveDBPath)) {
    fs.writeFileSync(leaveDBPath, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  
  const content = fs.readFileSync(leaveDBPath, 'utf8');
  try {
    const parsed = JSON.parse(content || '{}');
    return {
      fullLeaves: Array.isArray(parsed.fullLeaves) ? parsed.fullLeaves : [],
      halfLeaves: Array.isArray(parsed.halfLeaves) ? parsed.halfLeaves : [],
    };
  } catch (err) {
    console.error('Invalid JSON in leave database. Reinitializing...');
    fs.writeFileSync(leaveDBPath, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
}

function saveLeaveDB(db) {
  try {
    fs.writeFileSync(leaveDBPath, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

function getTodayLeaves() {
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  
  const db = loadLeaveDB();
  
  const todayFullLeaves = db.fullLeaves.filter(leave => {
    if (!leave.date || leave.status !== 'approved') return false;
    const dateParts = leave.date.split('.');
    if (dateParts.length !== 3) return false;
    return dateParts[0] == currentYear && dateParts[1] == currentMonth && dateParts[2] == today;
  });
  
  const todayHalfLeaves = db.halfLeaves.filter(leave => {
    if (!leave.requestedAt || leave.status !== 'approved') return false;
    const date = new Date(leave.requestedAt);
    return date.getDate() === today && date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });
  
  return { todayFullLeaves, todayHalfLeaves };
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const [username, password] = Buffer.from(authHeader.split(' ')[1] || '', 'base64').toString().split(':');
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      return next();
    }
  }
  
  if (req.session && req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}

app.get('/admin', (req, res) => {
  if (req.session && req.session.isAuthenticated) {
    res.redirect('/dashboard');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const sessionId = generateSessionId();
    sessions[sessionId] = { isAuthenticated: true, id: sessionId };
    res.json({ success: true, sessionId });
  } else {
    res.json({ success: false, message: 'Invalid username or password' });
  }
});

app.get('/logout', (req, res) => {
  if (req.session && req.session.id) {
    delete sessions[req.session.id];
  }
  res.redirect('/admin');
});

app.get('/today', (req, res) => {
  const { todayFullLeaves, todayHalfLeaves } = getTodayLeaves();
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = now.toLocaleDateString('en-US', options);
  
  res.render('today', {
    todayFullLeaves,
    todayHalfLeaves,
    currentDate
  });
});

app.get('/', (req, res) => {
  res.redirect('/admin');
});

app.get('/dashboard', requireAuth, (req, res) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  const search = req.query.search || '';
  
  const db = loadLeaveDB();
  let { fullLeaves, halfLeaves } = db;
  
  if (search) {
    const searchLower = search.toLowerCase();
    fullLeaves = fullLeaves.filter(leave => 
      (leave.name && leave.name.toLowerCase().includes(searchLower)) ||
      (leave.user && leave.user.includes(search))
    );
    halfLeaves = halfLeaves.filter(leave => 
      (leave.name && leave.name.toLowerCase().includes(searchLower)) ||
      (leave.user && leave.user.includes(search))
    );
  }
  
  const stats = {
    totalFull: db.fullLeaves.length,
    totalHalf: db.halfLeaves.length,
    approvedFull: db.fullLeaves.filter(l => l.status === 'approved').length,
    approvedHalf: db.halfLeaves.filter(l => l.status === 'approved').length,
    pendingFull: db.fullLeaves.filter(l => l.status === 'pending').length,
    pendingHalf: db.halfLeaves.filter(l => l.status === 'pending').length,
  };
  
  res.render('dashboard', {
    fullLeaves,
    halfLeaves,
    stats,
    year: currentYear,
    month: currentMonth,
    currentYear,
    currentMonth,
    search
  });
});

app.get('/api/leaves', requireAuth, (req, res) => {
  const db = loadLeaveDB();
  res.json(db);
});

app.post('/api/leaves/approve/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  const { user, dateOrTime } = req.body;
  const db = loadLeaveDB();
  
  try {
    if (type === 'full') {
      const index = db.fullLeaves.findIndex(leave => 
        leave.user === user && leave.date === dateOrTime && leave.status === 'pending'
      );
      if (index !== -1) {
        db.fullLeaves[index].status = 'approved';
        db.fullLeaves[index].approvedAt = new Date().toISOString();
        saveLeaveDB(db);
        res.json({ success: true, message: 'Leave approved successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Pending leave not found' });
      }
    } else if (type === 'half') {
      const index = db.halfLeaves.findIndex(leave => 
        leave.user === user && leave.time === dateOrTime && leave.status === 'pending'
      );
      if (index !== -1) {
        db.halfLeaves[index].status = 'approved';
        db.halfLeaves[index].approvedAt = new Date().toISOString();
        saveLeaveDB(db);
        res.json({ success: true, message: 'Leave approved successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Pending leave not found' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid leave type' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/leaves/reject/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  const { user, dateOrTime } = req.body;
  const db = loadLeaveDB();
  
  try {
    if (type === 'full') {
      const index = db.fullLeaves.findIndex(leave => 
        leave.user === user && leave.date === dateOrTime && leave.status === 'pending'
      );
      if (index !== -1) {
        db.fullLeaves[index].status = 'rejected';
        db.fullLeaves[index].rejectedAt = new Date().toISOString();
        saveLeaveDB(db);
        res.json({ success: true, message: 'Leave rejected successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Pending leave not found' });
      }
    } else if (type === 'half') {
      const index = db.halfLeaves.findIndex(leave => 
        leave.user === user && leave.time === dateOrTime && leave.status === 'pending'
      );
      if (index !== -1) {
        db.halfLeaves[index].status = 'rejected';
        db.halfLeaves[index].rejectedAt = new Date().toISOString();
        saveLeaveDB(db);
        res.json({ success: true, message: 'Leave rejected successfully' });
      } else {
        res.status(404).json({ success: false, message: 'Pending leave not found' });
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid leave type' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/leaves/delete/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  const { user, date, time } = req.body;
  const db = loadLeaveDB();
  
  if (type === 'full') {
    const index = db.fullLeaves.findIndex(leave => 
      leave.user === user && leave.date === date
    );
    if (index !== -1) {
      db.fullLeaves.splice(index, 1);
      saveLeaveDB(db);
      res.json({ success: true, message: 'Full leave deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Leave not found' });
    }
  } else if (type === 'half') {
    const index = db.halfLeaves.findIndex(leave => 
      leave.user === user && leave.time === time
    );
    if (index !== -1) {
      db.halfLeaves.splice(index, 1);
      saveLeaveDB(db);
      res.json({ success: true, message: 'Half leave deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Leave not found' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Invalid leave type' });
  }
});

app.get('/download-pdf', requireAuth, (req, res) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  
  const db = loadLeaveDB();
  const { fullLeaves, halfLeaves } = db;
  
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const filename = `Leave_Report_${monthNames[month-1]}_${year}.pdf`;
  res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-type', 'application/pdf');
  
  doc.pipe(res);
  
  doc.fontSize(20).fillColor('#667eea').text('Leave Management Report', { align: 'center' });
  doc.fontSize(14).fillColor('#666').text(`${monthNames[month-1]} ${year}`, { align: 'center' });
  doc.moveDown(1);
  
  const stats = {
    totalFull: fullLeaves.length,
    totalHalf: halfLeaves.length,
    approvedFull: fullLeaves.filter(l => l.status === 'approved').length,
    approvedHalf: halfLeaves.filter(l => l.status === 'approved').length,
  };
  
  doc.fontSize(14).fillColor('#667eea').text('Summary Statistics', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#333');
  doc.text(`Total Full Day Leaves: ${stats.totalFull} (Approved: ${stats.approvedFull})`);
  doc.text(`Total Half Day Leaves: ${stats.totalHalf} (Approved: ${stats.approvedHalf})`);
  doc.moveDown(2);
  
  doc.fontSize(14).fillColor('#667eea').text('Full Day Leaves', { underline: true });
  doc.moveDown(0.5);
  
  if (fullLeaves.length === 0) {
    doc.fontSize(11).fillColor('#999').text('No full day leaves recorded for this month.');
  } else {
    const tableTop = doc.y;
    const colWidths = [30, 120, 80, 80, 80];
    const rowHeight = 25;
    
    ['#', 'Name', 'Phone', 'Date', 'Status'].forEach((header, i) => {
      let x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.fontSize(10).fillColor('#fff').rect(x, tableTop, colWidths[i], rowHeight).fillAndStroke('#667eea');
      doc.fillColor('#fff').text(header, x + 5, tableTop + 8, { width: colWidths[i] - 10 });
    });
    
    let y = tableTop + rowHeight;
    fullLeaves.forEach((leave, index) => {
      const rowColor = index % 2 === 0 ? '#f5f5f5' : '#fff';
      doc.rect(50, y, colWidths.reduce((a, b) => a + b), rowHeight).fillAndStroke(rowColor, '#ddd');
      
      [
        (index + 1).toString(),
        leave.name || 'Unknown',
        leave.user ? leave.user.split('@')[0].substring(0, 12) : 'N/A',
        leave.date || 'N/A',
        leave.status || 'pending'
      ].forEach((text, i) => {
        let x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.fontSize(9).fillColor('#333').text(text, x + 5, y + 8, { width: colWidths[i] - 10 });
      });
      
      y += rowHeight;
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  }
  
  doc.addPage();
  doc.fontSize(14).fillColor('#667eea').text('Half Day Leaves', { underline: true });
  doc.moveDown(0.5);
  
  if (halfLeaves.length === 0) {
    doc.fontSize(11).fillColor('#999').text('No half day leaves recorded for this month.');
  } else {
    const tableTop = doc.y;
    const colWidths = [30, 120, 80, 80, 80];
    const rowHeight = 25;
    
    ['#', 'Name', 'Phone', 'Time', 'Status'].forEach((header, i) => {
      let x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.fontSize(10).fillColor('#fff').rect(x, tableTop, colWidths[i], rowHeight).fillAndStroke('#667eea');
      doc.fillColor('#fff').text(header, x + 5, tableTop + 8, { width: colWidths[i] - 10 });
    });
    
    let y = tableTop + rowHeight;
    halfLeaves.forEach((leave, index) => {
      const rowColor = index % 2 === 0 ? '#f5f5f5' : '#fff';
      doc.rect(50, y, colWidths.reduce((a, b) => a + b), rowHeight).fillAndStroke(rowColor, '#ddd');
      
      [
        (index + 1).toString(),
        leave.name || 'Unknown',
        leave.user ? leave.user.split('@')[0].substring(0, 12) : 'N/A',
        leave.time || 'N/A',
        leave.status || 'pending'
      ].forEach((text, i) => {
        let x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.fontSize(9).fillColor('#333').text(text, x + 5, y + 8, { width: colWidths[i] - 10 });
      });
      
      y += rowHeight;
    });
  }
  
  doc.moveDown(3);
  const chartY = doc.y;
  if (chartY < 600) {
    doc.fontSize(12).fillColor('#667eea').text('Monthly Leave Trend', { align: 'center' });
    doc.moveDown(0.5);
    
    const chartWidth = 400;
    const chartHeight = 150;
    const chartX = (doc.page.width - chartWidth) / 2;
    const maxValue = Math.max(stats.totalFull, stats.totalHalf, 1);
    
    const barWidth = 80;
    const spacing = 100;
    
    const fullHeight = (stats.totalFull / maxValue) * chartHeight;
    doc.rect(chartX + 50, chartY + chartHeight - fullHeight, barWidth, fullHeight).fillAndStroke('#4caf50');
    doc.fontSize(10).fillColor('#333').text('Full Day', chartX + 50, chartY + chartHeight + 10, { width: barWidth, align: 'center' });
    doc.text(stats.totalFull.toString(), chartX + 50, chartY + chartHeight - fullHeight - 15, { width: barWidth, align: 'center' });
    
    const halfHeight = (stats.totalHalf / maxValue) * chartHeight;
    doc.rect(chartX + 150, chartY + chartHeight - halfHeight, barWidth, halfHeight).fillAndStroke('#ff9800');
    doc.fontSize(10).fillColor('#333').text('Half Day', chartX + 150, chartY + chartHeight + 10, { width: barWidth, align: 'center' });
    doc.text(stats.totalHalf.toString(), chartX + 150, chartY + chartHeight - halfHeight - 15, { width: barWidth, align: 'center' });
  }
  
  doc.moveDown(3);
  doc.fontSize(10).fillColor('#999').text(`Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Colombo' })}`, { align: 'center' });
  doc.text('© BuyMore Technical Team', { align: 'center' });
  
  doc.end();
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Dashboard: http://0.0.0.0:${PORT}`);
});
