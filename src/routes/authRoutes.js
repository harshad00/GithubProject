import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    // User is automatically stored in session
    // Log in the user in the session
    req.login(req.user, (err) => {
      if (err) return res.status(500).json({ error: 'Login failed' });

      // Optionally, create JWT as well
      const token = jwt.sign(
        { id: req.user._id, username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 1000 * 60 * 60, // 1 hour
      });


      res.redirect('https://gh-trackr-fornt-end.vercel.app');
    }
    );

  });

// Get logged in user
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out", error: err });
    }

    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // clear session cookie
      res.redirect("http://localhost:5173");
      // res.status(200).json({ message: "Logged out successfully" });
    });
  });
});


export default router;