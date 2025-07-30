// testToken.js
import dotenv from 'dotenv';
import { generateToken, verifyToken } from './src/controllers/authController.js';

dotenv.config();

const dummyUser = {
  _id: '64db9387a4f1d2c2b9d6c8e7',
  username: 'harshad',
  email: 'harshad@example.com'
};

const token = generateToken(dummyUser);
console.log('Generated Token:', token);

// Optional: Verify the token
const decoded = verifyToken(token);
console.log('Decoded Token:', decoded);
