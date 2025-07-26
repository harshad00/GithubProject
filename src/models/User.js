import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  email: String,
  avatar: String
});

module.exports = mongoose.model('User', userSchema);
