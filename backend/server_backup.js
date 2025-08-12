const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS: allow multiple local dev origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL // optionally set in .env
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // non-browser tools
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('Blocked CORS origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simple request logger (debug only; remove or refine for production)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Add a test route
app.get('/', (req, res) => {
  res.json({ message: 'Bank Statement Converter API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Test route
app.get('/api/test-admin', (req, res) => {
  res.json({ message: 'Admin test route works!' });
});

// Test admin route - simple version
app.post('/api/admin/login', (req, res) => {
  console.log('Admin login hit!', req.body);
  const { username, password } = req.body;
  if (username === 'Admin' && password === '@admin#5656') {
    res.json({ success: true, token: 'test-admin-token' });
  } else {
    res.status(401).json({ message: 'Invalid admin credentials' });
  }
});

// List registered routes (debug helper)
app.get('/api/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(mw => {
    if (mw.route && mw.route.path) {
      const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
      routes.push({ path: mw.route.path, methods });
    } else if (mw.name === 'router' && mw.handle.stack) {
      mw.handle.stack.forEach(r => {
        if (r.route) {
          const methods = Object.keys(r.route.methods).join(',').toUpperCase();
          routes.push({ path: r.route.path, methods });
        }
      });
    }
  });
  res.json(routes);
});

// -------------------- Simple In-File User Store --------------------
// (For production replace with a real database)
const USERS_FILE = path.join(__dirname, 'users.json');

function readUsers() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    console.log('Register attempt:', email);
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const users = readUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, fullName: fullName || email.split('@')[0], password: hashed, createdAt: new Date().toISOString() };
    users.push(newUser);
    writeUsers(users);
    const token = generateToken(newUser);
    console.log('Register success:', email);
    res.status(201).json({ user: { id: newUser.id, email: newUser.email, fullName: newUser.fullName }, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const users = readUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!existing) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, existing.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  const token = generateToken(existing);
  res.json({ user: { id: existing.id, email: existing.email, fullName: existing.fullName }, token });
});

// Current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const users = readUsers();
  const u = users.find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ message: 'User not found' });
  res.json({ id: u.id, email: u.email, fullName: u.fullName });
});

// Logout (stateless JWT; client just discards token)
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// Admin middleware
function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) return res.status(401).json({ message: 'No admin token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid admin token' });
  }
}

// Get all users (admin only)
app.get('/api/admin/users', adminMiddleware, (req, res) => {
  try {
    const users = readUsers();
    const userList = users.map((user, index) => ({
      id: user.id,
      number: index + 1,
      email: user.email,
      fullName: user.fullName || user.email.split('@')[0],
      filesConverted: user.filesConverted || 0,
      createdAt: user.createdAt
    }));
    res.json(userList);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

app.post('/api/convert', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Track file conversion for authenticated users
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        if (decoded.id && decoded.role !== 'admin') {
          // Increment file conversion count for user
          const users = readUsers();
          const userIndex = users.findIndex(u => u.id === decoded.id);
          if (userIndex !== -1) {
            users[userIndex].filesConverted = (users[userIndex].filesConverted || 0) + 1;
            writeUsers(users);
            console.log(`File conversion tracked for user: ${decoded.email}`);
          }
        }
      } catch (err) {
        // Token invalid but continue with conversion
        console.log('Invalid token for file conversion tracking');
      }
    }

    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);
    const lines = data.text.split('\n').filter(line => line.trim());
    
    const transactions = lines.map(line => {
      return {
        date: line.substring(0, 10),
        description: line.substring(10, 50).trim(),
        amount: line.substring(50).trim()
      };
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const excelFileName = `converted-${Date.now()}.xlsx`;
    const excelFilePath = path.join(config.UPLOAD_DIR, excelFileName);
    XLSX.writeFile(workbook, excelFilePath);

    res.download(excelFilePath, (err) => {
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(excelFilePath);
      if (err) next(err);
    });

  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
  console.log(`Test the API at http://localhost:${config.PORT}`);
});