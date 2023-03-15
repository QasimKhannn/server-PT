const db = require("../models/index");
const User = db.user
// const tokenList = {}
const jwt = require('jsonwebtoken')
const config = require('../config/auth.config')
const bcrypt = require('bcryptjs')

exports.signup = async (req, res) => {
    //Existing user already
    //Hashed password
    //User Creation
    //toke generation
    const { name, email, password, address, phone, profileImg, posts } = req.body
    try {
        const existingUser = await User.findOne({ email: email })
        if (existingUser.email) {
            return res.status(400).send({
                status: "error",
                message: "email already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const result = await db.create({
            name: name,
            email: email,
            password: hashedPassword,
            address: address,
            phone: phone,
            profileImg: profileImg,
            posts: posts
        })

        const token = jwt.sign({ email: result.email, id: result.id }, config.secret)

        res.status(201).json({
            user: result,
            token: token
        })
    } catch (err) {
        return res.status(500).send({
            status: "error",
            message: "something went wrong, please try again later"
        })
    }

}

// exports.login = (req, res) => {
//     const { email, password } = req.body;
//     const userLoginInfo = {
//         email: email,
//         password: password
//     }

//     console.log('entered the login controller', password, email);
//     if (!email || !password) {
//         return res.send({
//             status: "error",
//             message: "user password or email not provided"
//         })
//     }
//     User.findOne({ password }, (err, user) => {
//         if (err) {
//             return res.status(500).send({
//                 status: "error",
//                 message: "something went wrong, please try again later"
//             })
//         }
//         console.log('entered the find user call back', user);
//         if (user) {
//             console.log('user found')
//             User.findOne({ email }, (err, email) => {
//                 console.log('entered the find email call back', email)
//                 if (err) {
//                     return res.status(500).send({
//                         status: "error",
//                         message: "email not correct"
//                     })
//                 }
//                 if (email) {
//                     console.log('email found')
//                     const token = jwt.sign(userLoginInfo, config.secret, { expiresIn: config.tokenLife, })
//                     const refreshToken = jwt.sign(userLoginInfo, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife })
//                     const response = {
//                         user: user.name,
//                         email: user.email,
//                         token: token,
//                         refreshToken: refreshToken,
//                     }
//                     tokenList[refreshToken] = response
//                     return res.status(200).send({
//                         status: "Successfully logged in",
//                         data: response
//                     });
//                 } else {
//                     console.log('email not found');
//                     return res.status(500).send({
//                         status: "error",
//                         message: "user password or email not found"
//                     })
//                 }
//             })
//         } else {
//             console.log('user not found');
//             return res.status(500).send({
//                 status: "error",
//                 message: "user password or email not found"
//             })
//         }
//     })

// }
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUsers = await User.findOne({ email: email });
    if (!existingUsers) {
      return res.status(404).json({ message: "User not found" });
    } else if (existingUsers.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    } else {
      const token = jwt.sign(
        { email: existingUsers.email, id: existingUsers._id },
        config.secret
      );

      res.status(201).json({
        token: token,
        user: existingUsers,
      });
    }
  } catch (err) {
    console.log("something went wrong: " + err.message);
  }
};
