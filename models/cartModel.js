const mongoose = require("mongoose");
//schema of model
const cartSchema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    productId:{          //
        type:String,
    },
    productName: {        //
        type: String
    },
    quantity: {         //
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {          //
        type: Number
    },
    category: {
        // type: String,
        // required: true
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    // stock:{
    //     type:Number
    // },
    // image:{
    //     type:Array,
    // },
    size:{
        type:Number,
        required:true
    },
    //   bill: {
    // type: Number,
    // default: 0
    // },
    // orderStatus: {
    // type: String,
    // }

});

module.exports=mongoose.model('Cart',cartSchema) //can be used anywhere in the project 









// const mongoose=require("mongoose")
// const Schema=mongoose.Schema

// const cartSchema=new Schema({
//     owner: {
//         type: String,
//         required: true
//     },
//         productId:{
//             type:String,
//         },
//         productName: {
//             type: String
//         },
//         quantity: {
//             type: Number,
//             required: true,
//             min: 1,
//             default: 1
//         },
//         price: {
//             type: Number
//         },
//         category: {
//             type: String,
//             required: true
//         },stock:{
//             type:Number
//         },
//         img1: {
//             type: String,
//             required: true
//         },
//         size:{
//             type:Number,
//             required:true
//         },
//     bill: {
//         type: Number,
//         default: 0
//     },
//     orderStatus: {
//         type: String,
//     }

// })
// const Cart=mongoose.model('Cart',cartSchema)
// module.exports=Cart;