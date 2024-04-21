const User = require('../models/User');
const { validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const { transporter } = require('../config/email');

const JWT_SECRET = process.env.JWT_SECRET;

const registerUser = async (req, res) => {
  let success = false;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, errors: errors.array() });
  }
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res
        .status(400)
        .json({ success, error: 'Sorry user with this email already exists' });
    }

    user = await User.create({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
    });

    const data = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken, data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res
        .status(400)
        .json({ error: 'Please try to login with correct credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ error: 'Please try to login with correct credentials' });
    }

    const data = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);
    success = true;
    res.json({ success, authtoken, data });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
};

const getUsers = async (req, res) => {
  try {
    const user = await User.find().select('-password');
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select(
      '-password'
    );
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Internal server error');
  }
};

const sendPasswordLink = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(401).json({ status: 401, message: 'Enter Your Email' });
  }

  try {
    const userfind = await User.findOne({ email: email });

    // token generate for reset password
    const token = jwt.sign({ _id: userfind._id }, JWT_SECRET, {
      expiresIn: '300s',
    });

    const setusertoken = await User.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );

    if (setusertoken) {
      const mailOptions = {
        from: process.env.USER_EMAIL,
        to: email,
        subject: 'Sending Email For password Reset',
        text: `This Link Valid For 5 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
        // text: `This Link Valid For 5 MINUTES https://login-functionality-tlcc.vercel.app/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('sendMail error', error);
          res.status(401).json({ status: 401, message: 'email not send' });
        } else {
          console.log('Email sent', info.response);
          res
            .status(201)
            .json({ status: 201, message: 'Email sent Succsfully' });
        }
      });
    }
  } catch (error) {
    res.status(401).json({ status: 401, message: 'invalid user' });
  }
};

const resetPassword = async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const validuser = await User.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, JWT_SECRET);

    if (validuser && verifyToken._id) {
      const setnewuserpass = await User.findByIdAndUpdate(
        { _id: id },
        { password }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: 'user not exist' });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUsers,
  getUserByEmail,
  sendPasswordLink,
  resetPassword,
};
