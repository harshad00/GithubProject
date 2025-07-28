import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        try {
            const token = jwt.sign(
                { id: req.user._id, username: req.user.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Send token in query params to frontend
            res.redirect(`http://localhost:5173/?token=${token}`);
        } catch (error) {
            console.error("Error generating JWT token:", error);
            res.redirect('http://localhost:5173/?error=auth_failed');
        }
    }
);


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
            res.status(200).json({ message: "Logged out successfully" });
        });
    });
});


export default router;