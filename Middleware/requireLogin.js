// const jwt = require("jsonwebtoken");
// const JWT_SECRET = process.env.JWT_SECRET
// const mongoose = require("mongoose");
// const User = mongoose.model("Owner")
// // const Employee = mongoose.model("Employee")
// const Employee = mongoose.model("Employee")

// module.exports = (req,res,next)=>{


//     const {authorization} = req.headers


     
//     if(!authorization){

//       return  res.status(404).json({error:"Not Loggedin"})
//     }
    
//     const token = authorization.replace("Bearer ","")
//     jwt.verify(token, JWT_SECRET,(err, payload)=>{

//         if(err){
//            return res.status(401).json({error:"Login error"})
//         }

//         const {_id} = payload
//         User.findById(_id).then(userdata=>{

//             if(userdata){
//                 req.user = userdata
//                 next()
//             }
//             else{
//                 Employee.findById(_id).then(userdata=>{

//                     req.user = userdata
//                next()
               
              
               
              
//            })
//             }
            
           
            
           
//         })
        
//     })

// }
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const mongoose = require("mongoose");
const Owner = mongoose.model("Owner");
const Employee = mongoose.model("Employee");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    
    // Check if authorization header exists
    if (!authorization) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    // Extract token
    const token = authorization.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }
    
    // Verify JWT token
    const payload = jwt.verify(token, JWT_SECRET);
    
    if (!payload || !payload._id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }
    
    const { _id } = payload;
    
    // Try to find user in Owner or Employee collections
    let userdata = await Owner.findById(_id);
    
    if (!userdata) {
      userdata = await Employee.findById(_id);
    }
    
    if (!userdata) {
      return res.status(401).json({ error: "User not found" });
    }
    
    // Set user in request object with explicit employeeId
    req.user = {
      ...userdata._doc,  // Include all user data
      employeeId: userdata._id  // Explicitly include the employeeId property
    };
    
    // Log for debugging
    console.log("Authenticated user:", {
      id: req.user._id,
      employeeId: req.user.employeeId,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    
    return res.status(401).json({ error: "Authentication failed" });
  }
};