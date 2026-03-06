const jwt = require("jsonwebtoken");

const JWT_SECRET = "mysecretkey";

exports.verifyToken = (req,res,next)=>{

  const authHeader = req.headers["authorization"];

  if(!authHeader)
    return res.status(403).json({message:"Token missing"});

  const token = authHeader.split(" ")[1];

  jwt.verify(token,JWT_SECRET,(err,decoded)=>{

    if(err)
      return res.status(401).json({message:"Invalid token"});

    req.user = decoded;

    next();

  });

};