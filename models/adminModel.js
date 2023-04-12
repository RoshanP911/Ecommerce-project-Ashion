const mongoose=require('mongoose')


//schema of model
const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },

    password:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model('Admin',adminSchema) //can be used anywhere in the project 