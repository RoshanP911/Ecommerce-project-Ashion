const mongoose=require('mongoose')

const mongoosePaginate = require('mongoose-paginate-v2');


//schema of model
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    is_blocked:{
        type:Boolean,
        required:true
    },

});

productSchema.plugin(mongoosePaginate);
//const Product = mongoose.model('Product', ProductSchema);


module.exports=mongoose.model('product',productSchema) //can be used anywhere in the project 