const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {User} = require("../models/userSchema");

const signup = async (req, res) => {
   const {username, password, userType, address} = req.body;

   try {
      const userr = await User.find({username});

      if (userr.length) {
         // console.log("userr", userr);
         res.status(200).json({msg: "User exist please Login"});
      } else {
         //Hash password
         const hashedPassword = await bcrypt.hash(password, 10);
         let user = new User({username, password: hashedPassword, userType, address});
         await user.save();

         res.status(201).json({msg: "New user registered"});
      }
   } catch (err) {
      console.log("ERROR Cant Signup", err);
   }
};

const login = async (req, res) => {
   const {username, password} = req.body;

   try {
      const user = await User.findOne({username});

      if (user && (await bcrypt.compare(password, user.password))) {
         const token = jwt.sign(
            {userId: user._id, userType: user.userType},
            process.env.ACCESS_TOKEN_SECERT,
            {
               expiresIn: "12h"
            }
         );

         res.setHeader("authorization", `Bearer ${token}`);
         console.log({msg: "User successfully logged in", token: token});
         console.log(req.userID);
         res.status(201).json({msg: "User successfully logged in", token: token});
      } else {
         res.status(200).send({msg: "Unauthorized  Invalid email or password"});
      }
   } catch (err) {
      console.log("Error Cant Login", err);
      res.status(500).send({ERROR: err});
   }
};

module.exports = {
   signup: signup,
   login: login
};
