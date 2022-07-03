const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/userModel');
const Admin = require('./models/adminModal');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/Book-App');

app.post('/api/register', async (req, res) => {
  let newPassword = await bcrypt.hash(req.body.password, 10);
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: newPassword,
    });
    res.json({ status: 'ok' });
  } catch (err) {
    res.json({ status: 'error', error: 'duplicate' });
  }
});

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user) {
    return res.json({ status: 'error', user: false, error: 'email' });
  }
  let LoginPassword = await bcrypt.compare(req.body.password, user.password);
  if (LoginPassword) {
    const token = jwt.sign(
      {
        email: user.email,
      },
      'secretKey'
    );
    return res.json({ status: 'ok', user: true, token });
  } else {
    return res.json({
      status: 'error',
      user: false,
      error: 'password',
    });
  }
});

app.get('/api/quote', async (req, res) => {
  const token = req.headers['x-access-token'];
  try {
    const decoded = jwt.verify(token, 'secretKey');
    const email = decoded.email;
    let user = await User.findOne({ email: email });
    return res.json({ status: 'ok', quote: user.quote, user: true });
  } catch (err) {
    res.json({ status: 'error', error: 'invalid token', user: false });
  }
});

app.post('/api/quote', async (req, res) => {
  const token = req.headers['x-access-token'];
  try {
    const decoded = jwt.verify(token, 'secretKey');
    const email = decoded.email;
    await User.updateOne({ email: email }, { $set: { quote: req.body.quote } });

    return res.json({ status: 'ok' });
  } catch (err) {
    res.json({ status: 'error', error: 'invalid token' });
  }
});

// admin

app.post('/api/adminLogin', async (req, res) => {
  const admin = await Admin.findOne({
    email: req.body.email,
  });
  if (!admin) {
    return res.json({ status: 'error', admin: false, error: 'invalid email' });
  }
  let LoginPassword = await bcrypt.compare(req.body.password, admin.password);
  if (LoginPassword) {
    const token = jwt.sign(
      {
        email: admin.email,
      },
      'secretKey'
    );
    return res.json({ status: 'ok', admin: true, token });
  } else {
    return res.json({
      status: 'error',
      admin: false,
      error: 'invalid password',
    });
  }
});

app.get('/api/userData', async (req, res) => {
  const token = req.headers['x-access-token'];
  try {
    let decode = jwt.verify(token, 'secretKey');
    if (decode) {
      let userData = await User.find();
      return res.json({ status: 'ok', userData });
    }
  } catch (err) {
    return res.json({ status: 'error', error: 'No data fount' });
  }
});

app.post('/api/mangeSubmit', async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.body.id },
      {
        ...req.body,
      }
    );
    return res.json({ status: 'ok' });
  } catch (err) {
    return res.json({ status: 'error' });
  }
});

app.delete('/api/deleteUser', async (req, res) => {
  try {
    console.log(req.body);
    let response = await User.deleteOne({ _id: req.body.id });
    console.log(response);
    return res.json({ status: true });
  } catch (err) {
    console.log(err);
  }
});
app.listen(1300, () => {
  console.log('server started');
});
