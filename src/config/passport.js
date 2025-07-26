import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: [ 'user:email' ]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log("GitHub profile:", profile);

    const existingUser = await User.findOne({ githubId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    const newUser = await User.create({
      githubId: profile.id,
      username: profile.username,
      email: profile.emails?.[0]?.value || "",
      avatar: profile.photos?.[0]?.value || ""
    });

    return done(null, newUser);
  } catch (error) {
    console.error("Error in GitHub strategy:", error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
      console.log( "Error deserializing user:", error);
      
    done(error, null);
  }
});

export default passport;
