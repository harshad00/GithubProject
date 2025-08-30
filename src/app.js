import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/authRoutes.js';
import github from './routes/getRepo.js';
import useralldata from './routes/useralldata.js';
import summar from './routes/summar.js';
import testRouter from './routes/test.js';

dotenv.config();
const app = express();

// ---------- CORS ----------
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ---------- Body Parsers ----------
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// ---------- SESSION ----------
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true on Render HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// ---------- PASSPORT ----------
app.use(passport.initialize());
app.use(passport.session());

// ---------- ROUTES ----------
app.use('/auth', authRoutes);
app.use('/api/github', github);
app.use('/api/user', useralldata);
app.use('/api/summar', summar);
app.use('/test', testRouter);

// ---------- DEFAULT ROUTE ----------
app.get('/', (req, res) => {
  res.send('Backend is running');
});

export { app };
