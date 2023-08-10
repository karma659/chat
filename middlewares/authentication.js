const jwt = require("jsonwebtoken");

// Middleware for verifying JWT token and checking user role
const verifyToken = async (req, res, next) => {
   try {
      // Get the JWT token from the request header
      const token = req.headers.authorization.split(" ")[1];
      // console.log("token", token);
      // Verify the token using the secret key
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECERT);
      // console.log(" decodedToken ", decodedToken);
      // Attach the user object or user ID and role to the request object for future use
      req.userId = decodedToken.userId;
      req.userType = decodedToken.userType;
      console.log("ID role", req.userId, req.userType);

      next();
   } catch (error) {
      return res.status(401).json({message: "Unauthorized"});
   }
};

module.exports = {
   verifyToken,
};
