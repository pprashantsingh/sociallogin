const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    facebookId: String,
    googleId: String,
    name: String,
    email: String,
    avatar: String,
})

module.exports = mongoose.model('User', userSchema)
