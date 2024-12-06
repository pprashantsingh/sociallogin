const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const cors = require('cors')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./model/login');
const route = require('./route/login')
const app = express()
app.use(cors())
app.use(express.json())
dotenv.config();
app.use('/api',route)

mongoose.connect('mongodb://127.0.0.1:27017/google-auth');

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          console.log(profile,"check ")
          if (!user) {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0].value,
            });
          }
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // Facebook Strategy Configuration
passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID, 
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/auth/facebook/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile,"profile")
          let user = await User.findOne({ facebookId: profile.id });
          if (!user) {
            user = await User.create({
              facebookId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0]?.value || '', 
              avatar: profile.photos?.[0]?.value || '',
            });
          }
          done(null, user); // Pass user to Passport
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
  
  // Initialize Passport
  app.use(passport.initialize());

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '60s' });
      res.redirect(`http://localhost:4200?token=${token}`);
    }
  );

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.redirect(`http://localhost:4200?token=${token}`);
  }
);


  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
  