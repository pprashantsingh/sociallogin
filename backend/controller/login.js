const user = require('../model/login')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const profile = function (req,res){
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).send('Access denied.');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user.findById(decoded.id).then((user) => res.json(user));
    } catch (err) {
      res.status(400).send('Invalid token.');
    }
}

module.exports = {profile}