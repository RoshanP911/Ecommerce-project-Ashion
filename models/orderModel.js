const mongoose = require("mongoose");

//schema of order model
const orderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    //as user can order multiple products
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product", //use same name as in product model collection name last
      },
      quantity: {
        type: Number,
      },
      price: {
        type: Number,
      },
    },
  ],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },

  totalBill: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["ordered", "shipped", "delivered"],
    default: "ordered",
  },
  paymentMode: {
    type: String,
    enum: ["cashondelivery", "razorpay", "pending"],
    default: "pending",
  },
  dateOrdered: {
    type: Date,
    default: Date.now,
  },
  discountAmt: {
    type: Number,
  },
  coupon: {
    type: String,
  }
});

module.exports = mongoose.model("order", orderSchema); //can be used anywhere in the project
