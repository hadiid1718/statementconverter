const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

// Import Models
const User = require('./models/User');
const File = require('./models/File');

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

const app = express();

// CORS: allow multiple local dev origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn('Blocked CORS origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Bank Statement Converter API is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// -------------------- ADMIN ROUTES --------------------
// Admin login - Database version
app.post('/api/admin/login', async (req, res) => {
  console.log('=== ADMIN LOGIN ATTEMPT ===');
  console.log('Body:', req.body);
  
  try {
    const { username, password } = req.body;
    
    // Try database first
    let admin;
    if (username.includes('@')) {
      // Email-based login
      admin = await User.findOne({ email: username.toLowerCase(), role: 'admin' });
    } else {
      // Username-based login (fallback to hardcoded admin)
      if (username === 'Admin' && password === '@admin#5656') {
        console.log('Admin login SUCCESS (hardcoded)');
        const token = jwt.sign(
          { id: 'admin', username: 'Admin', role: 'admin' },
          process.env.JWT_SECRET || 'dev_secret',
          { expiresIn: '7d' }
        );
        return res.json({
          admin: { id: 'admin', username: 'Admin', role: 'admin' },
          token: token
        });
      }
    }

    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        console.log('Admin login SUCCESS (database)');
        const token = jwt.sign(
          { id: admin._id, email: admin.email, role: 'admin' },
          process.env.JWT_SECRET || 'dev_secret',
          { expiresIn: '7d' }
        );
        return res.json({
          admin: { 
            id: admin._id, 
            username: admin.fullName, 
            email: admin.email,
            role: 'admin' 
          },
          token: token
        });
      }
    }

    console.log('Admin login FAILED - wrong credentials');
    res.status(401).json({ message: 'Invalid admin credentials' });
    
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
});

// -------------------- USER and FILE STORE (Database) --------------------
// File functions removed - now using MongoDB

function generateToken(user) {
  return jwt.sign({ 
    id: user._id || user.id, 
    email: user.email 
  }, process.env.JWT_SECRET || 'dev_secret', { 
    expiresIn: '7d' 
  });
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
app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    
    const userList = users.map((user, index) => ({
      id: user._id,
      number: index + 1,
      email: user.email,
      fullName: user.fullName,
      filesConverted: user.filesConverted,
      createdAt: user.createdAt
    }));
    
    res.json(userList);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// -------------------- USER AUTH ROUTES --------------------
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    console.log('Register attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashed,
      fullName: fullName || email.split('@')[0],
      filesConverted: 0
    });

    await newUser.save();
    
    const token = generateToken(newUser);
    console.log('Register success:', email);
    
    res.status(201).json({ 
      user: { 
        id: newUser._id, 
        email: newUser.email, 
        fullName: newUser.fullName 
      }, 
      token 
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Find user in database
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        fullName: user.fullName 
      }, 
      token 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.fullName 
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// respected user converted the file



// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' });
});

// -------------------- FILE PROCESSING --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Get user files endpoint (for dashboard)
app.get('/api/files', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const userId = decoded.id;

    // Find files for the user from database
    const userFiles = await File.find({ userId: userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'email fullName');

    res.json({ files: userFiles });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(401).json({ error: 'Invalid token or server error' });
  }
});

// app.post('/api/convert', upload.single('file'), async (req, res, next) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Track file conversion for authenticated users
//     const authHeader = req.headers.authorization || '';
//     const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
//     if (token) {
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
//         if (decoded.id && decoded.role !== 'admin') {
//           const users = readUsers();
//           const userIndex = users.findIndex(u => u.id === decoded.id);
//           if (userIndex !== -1) {
//             users[userIndex].filesConverted = (users[userIndex].filesConverted || 0) + 1;
//             writeUsers(users);
//             console.log(`File conversion tracked for user: ${decoded.email}`);
//           }
//         }
//       } catch (err) {
//         console.log('Invalid token for file conversion tracking');
//       }
//     }

//     const dataBuffer = fs.readFileSync(req.file.path);
//     const data = await pdfParse(dataBuffer);
//     const lines = data.text.split('\n').filter(line => line.trim());
    
//     const transactions = lines.map(line => {
//       return {
//         date: line.substring(0, 10),
//         description: line.substring(10, 50).trim(),
//         amount: line.substring(50).trim()
//       };
//     });

//     const workbook = XLSX.utils.book_new();
//     const worksheet = XLSX.utils.json_to_sheet(transactions);
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

//     const excelFileName = `converted-${Date.now()}.xlsx`;
//     const excelFilePath = path.join(config.UPLOAD_DIR, excelFileName);
//     XLSX.writeFile(workbook, excelFilePath);

//     res.download(excelFilePath, (err) => {
//       fs.unlinkSync(req.file.path);
//       fs.unlinkSync(excelFilePath);
//       if (err) next(err);
//     });

//   } catch (error) {
//     next(error);
//   }
// });

// -------------------- ERROR HANDLING --------------------

// Convert PDF to Excel endpoint (UPDATED with Database)
app.post('/api/convert', upload.single('file'), async (req, res, next) => {
  console.log('🔍 Convert API called');
  const startTime = Date.now();
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('🔍 File uploaded:', req.file.originalname);

    const authHeader = req.headers.authorization || '';
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    console.log('🔍 Token extracted:', token ? 'Yes' : 'No');
    
    let userId = null;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        userId = decoded.id;
        console.log('🔍 User ID from token:', userId);

        // Update user's file conversion count in database
        if (decoded.id && decoded.role !== 'admin') {
          await User.findByIdAndUpdate(
            decoded.id,
            { $inc: { filesConverted: 1 } },
            { new: true }
          );
          console.log(`File conversion tracked for user: ${decoded.email}`);
        }
      } catch (err) {
        console.log('Invalid token for file conversion tracking:', err.message);
      }
    } else {
      console.log("No token provided");
    }

    // PDF Processing
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

    // Excel Generation
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const excelFileName = `converted-${Date.now()}.xlsx`;
    const excelFilePath = path.join(config.UPLOAD_DIR, excelFileName);
    XLSX.writeFile(workbook, excelFilePath);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Save the file record to database
    if (userId) {
      try {
        const fileRecord = new File({
          userId: userId,
          originalName: req.file.originalname,
          convertedName: excelFileName,
          status: 'completed',
          outputFormat: 'XLSX',
          downloadUrl: `/api/files/download/${excelFileName}`,
          fileSize: req.file.size,
          processingTime: processingTime
        });
        
        await fileRecord.save();
        console.log(`File record saved to database for user: ${userId}`);
      } catch (dbError) {
        console.error('Error saving file record to database:', dbError);
        // Continue with file download even if database save fails
      }
    }

    res.download(excelFilePath, (err) => {
      fs.unlinkSync(req.file.path); // Clean up uploaded PDF
      // Keep the Excel file for download links
      if (err) next(err);
    });

  } catch (error) {
    // If there's an error, try to save failed status to database
    if (userId) {
      try {
        const failedFileRecord = new File({
          userId: userId,
          originalName: req.file.originalname,
          convertedName: '',
          status: 'failed',
          outputFormat: 'XLSX',
          downloadUrl: '',
          fileSize: req.file.size,
          processingTime: Date.now() - startTime,
          errorMessage: error.message
        });
        
        await failedFileRecord.save();
      } catch (dbError) {
        console.error('Error saving failed file record:', dbError);
      }
    }
    next(error);
  }
});
// Download endpoint for converted files
app.get('/api/files/download/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.UPLOAD_DIR, filename);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    next(error);
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFiles = await File.countDocuments();
    const totalFilesCompleted = await File.countDocuments({ status: 'completed' });
    const totalFilesFailed = await File.countDocuments({ status: 'failed' });
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.countDocuments({ 
      role: 'user',
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    const recentFiles = await File.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    res.json({
      totalUsers,
      totalFiles,
      totalFilesCompleted,
      totalFilesFailed,
      recentUsers,
      recentFiles,
      successRate: totalFiles > 0 ? ((totalFilesCompleted / totalFiles) * 100).toFixed(2) : 0
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get all files (admin only)
app.get('/api/admin/files', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const files = await File.find()
      .populate('userId', 'email fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalFiles = await File.countDocuments();

    res.json({
      files,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalFiles / limit),
        totalFiles,
        hasNext: page * limit < totalFiles,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching files:', err);
    res.status(500).json({ message: 'Error fetching files' });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

// -------------------- START SERVER --------------------
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
  console.log(`Test the API at http://localhost:${config.PORT}`);
});
