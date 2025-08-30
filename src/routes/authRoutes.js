import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub callback
router.get(
  '/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
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
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 3600000,
      });

      res.redirect('http://localhost:5173');
    });
  }
);


router.get("/user", (req, res) => {
  try {
    const token = req.cookies.token; // <-- make sure cookie-parser middleware is used!
    if (!token) {
      return res.status(401).json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ user: decoded });
  } catch (err) {
    console.error("Error in /auth/user:", err.message);
    res.status(500).json({ user: null, error: "Failed to fetch user" });
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