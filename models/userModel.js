const mongoose=require('mongoose')



//schema of model
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },

    is_blocked:{
        type: Boolean,
        required:true
    },
    cart:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',  //use same name as in product model collection name last
        },
        quantity:{
            type: Number,
        default: 1
        }
    }],

});

module.exports=mongoose.model('User',userSchema) //can be used anywhere in the project 