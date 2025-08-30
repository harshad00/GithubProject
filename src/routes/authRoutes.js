import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// GitHub login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    req.login(req.user, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });

      // Create JWT
      const token = jwt.sign(
        { id: req.user._id, username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 1000 * 60 * 60,
      });

      // ✅ Redirect to frontend
      res.redirect(process.env.FRONTEND_URL);
    });
  }
);

// Get logged in user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out", error: err });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      // ✅ Redirect to frontend instead of hardcoded localhost
      res.redirect(process.env.FRONTEND_URL);
    });
  });
});

export default router;
