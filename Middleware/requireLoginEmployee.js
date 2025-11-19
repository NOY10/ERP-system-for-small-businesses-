const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee")
// const Employee = mongoose.model("Employee")

module.exports = (req,res,next)=>{


    const {authorization} = req.headers


     
    if(!authorization){

      return  res.status(404).json({error:"Not Loggedin"})
    }
    
    const token = authorization.replace("Bearer ","")
    jwt.verify(token, JWT_SECRET,(err, payload)=>{

        if(err){
           return res.status(401).json({error:"Login error"})
        }

        
        const {_id} = payload
        Employee.findById(_id).then(userdata=>{

                 req.user = userdata
            next()
            
           
            
           
        })
        
    })

}