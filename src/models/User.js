// filepath: c:\Users\bholo\Desktop\github\src\models\User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    githubId: String,
    username: String,
    email: String,
    avatar: String,
});

export const User = mongoose.model("User", userSchema);