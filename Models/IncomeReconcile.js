const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema({

    
      amount:{
        type:Number
      },

      description:{
        type:String
      },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Owner"
    },

    date:{
        type:String
        //default: Date.now()
    },
})

mongoose.model('IncomeReconcile',incomeSchema)