const mongoose = require("mongoose")
const Schema = mongoose.Schema

const validateSchema = Schema({

   
    otp:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    expireToken:Date,

})

mongoose.model("Validate",validateSchema)