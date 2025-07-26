import express from 'express';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken'; 

const router = express.Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
        try {
            // Generate JWT token after successful authentication
            const token = jwt.sign(
                { id: req.user._id, username: req.user.username },
                process.env.JWT_SECRET, // Make sure this is set in your .env
                { expiresIn: '1h' }
            );
            res.status(200).json({
                message: 'Authentication successful',
                user: {
                    id: req.user._id,
                    username: req.user.username,
                    email: req.user.email,
                    avatar: req.user.avatar
                },
                token

            });
        } catch (error) {
            console.error("Error generating JWT token:", error);
            res.status(500).json({ message: 'Internal server error' });
        }
            
    }
);

export default router;