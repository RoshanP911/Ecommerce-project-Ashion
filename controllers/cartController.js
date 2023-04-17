// const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel"); //mongodb category model
const User = require("../models/userModel");
const Address = require("../models/addressModel");
const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Razorpay = require("razorpay");
const { log } = require("debug/src/node");
const { formField } = require("pdfkit");

//VIEW CART POPULATE
const viewCart = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const user = await User.findOne({ _id: userData1._id }).populate(
      "cart.product_id"
    );
    const categories = await Category.find();
    const cartData = user.cart;

    subTotal = findSubTotal(cartData);

    res.render("users/cart", { userData1, categories, subTotal, cartData });
  } catch (error) {
    console.log(error.message);
  }
};

//ADD TO CART
const addToCart = async (req, res) => {
  try {
    if (req.session.userdata) {
      //Redirect to Login Page if not Logged in When Pressing Add to Cart
      const userData1 = req.session.userdata;
      const categories = await Category.find();
      const productId = req.body.id;
      const quantity = 1;
      const productData = await Product.findById(productId);

      const existed = await User.findOne({
        _id: userData1._id,
        "cart.product_id": productId,
      });


      if (existed) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: userData1._id, "cart.product_id": productId }, //to find product._id inside cart array in usermodel
          { $inc: { "cart.$.quantity": quantity } },
          { new: true }
        );
        // "$" is commonly used as a symbol to represent the jQuery library in JavaScript programming language.
        //"cart.$.quantity" most likely means that the quantity of a certain item in the shopping cart is being accessed or manipulated using the jQuery library

        req.session.user = updatedUser; //che


        res.render("users/productdetails", {
          productData: productData,
          userData1,
          categories,
        });
      } else {
        const updatedUser = await User.findByIdAndUpdate(
          userData1._id,
          {
            $push: {
              cart: { product_id: productId },
            },
          },
          { new: true }
        );
        req.session.user = updatedUser;

        res.render("users/productdetails", {
          productData: productData,
          userData1,
          categories,
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//global function to find cart subtotal
function findSubTotal(cartData) {
  let subTotal = 0; // Initialize the sum of products to 0

  // Loop through each item in the shopping cart and add its price * quantity to the sum
  for (let i = 0; i < cartData.length; i++) {
    subTotal += cartData[i].product_id.price * cartData[i].quantity;
  }
  return subTotal;
}

// global function to find cart total after coupon applied
function findSubTotalCoupon(cartData, discount) {
  let subTotalCoupon = 0; // Initialize the sum of products to 0

  // Loop through each item in the shopping cart and add its price * quantity to the sum
  for (let i = 0; i < cartData.length; i++) {
    subTotalCoupon += cartData[i].product_id.price * cartData[i].quantity;
    subTotalCoupon = subTotalCoupon - discount;
  }
  return subTotalCoupon;
}

//CART OPERATIONS
const cartOperation = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const a = req.body;
    console.log(a);
    const data = await User.find(
      { _id: userData1._id },
      { _id: 0, cart: 1 }
    ).lean();

    data[0].cart.forEach((val, i) => {
      val.quantity = req.body.datas[i].quantity;
    });

    await User.updateOne(
      { _id: userData1._id },
      { $set: { cart: data[0].cart } }
    );

    res.json("from backend ,cartUpdation json");
  } catch (error) {
    console.log(error.message);
  }
};

//DELETE FROM CART
const deleteFromCart = async (req, res) => {
  try {
    const productId = req.query.id;

    console.log("productId");
    console.log(productId);
    const userData1 = req.session.userdata;

    const addressData = await User.findOneAndUpdate(
      { _id: userData1._id },
      { $pull: { cart: { product_id: productId } } },
      { new: true }
    );

    console.log("addressData");
    console.log(addressData);

    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

//COUPON CHECK
const couponCheck = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    let coupon = "";
    coupon = req.query.couponval.trim();  //FFFFFFFFFFFFFFFFF

    total = req.query.total.trim();

    const couponData = await Coupon.findOne({ code: coupon });

    if (!couponData || couponData.length == 0) {
      res.json({ message: `invalid coupon` });
    } else if (couponData.status == "inactive") {
      res.json({ messsage: `Inactive Coupon` });
    } else if (total < couponData.minBill) {
      res.json({ message: `Minimum bill amount is Rs ${couponData.minBill}` });
    } else if (couponData.userid.includes(userData1._id)) {
      res.json({ message: `Coupon already used` });
    } else {
      const discount = couponData.discount;

      const newTotal = total - discount;
      const success = true; //

      couponData.userid.push(userData1._id);
      await couponData.save();

      res.json({
        message: "Coupon applied successfully",
        discount,
        newTotal,
        success,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD CHECKOUT
const loadCheckout = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const user = await User.findOne({ _id: userData1._id }).populate(
      "cart.product_id"
    );
    const cartData = user.cart;
    const categories = await Category.find();

    subTotal = findSubTotal(cartData);

    const address = await Address.find({ owner: userData1._id });

    const addressData = address;

    res.render("users/checkout", {
      userData1,
      cartData: cartData,
      subTotal,
      addressData: addressData,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};


//PLACE ORDERRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRR
const placeOrder = async (req, res) => {
  try {
    const userData1 = req.session.userdata;


// console.log(('hostinggggggggdayy'));
//     console.log(req.body);

    const user = await User.findOne({ _id: userData1._id }).populate(
      "cart.product_id"
    ); //populating User model's cart array with product_id
    const cartData = user.cart; //check in model

    const paymentMethod = req.body.pay;
    await Address.findOne({ _id: req.body.address1 });

    const cartItems = cartData.map((item) => {
      return {
        product_id: item.product_id, //product_id frm order model, to show diff items in an order
        quantity: item.quantity,
      };
    });


//     console.log('req.body.totalAfterDiscounttttttttttttttttttttttttttttttttttttt');
// console.log(req.body.totalAfterDiscount);

console.log();
     //TOTAL AFTER DISCOUNT
    let finalTotal;
    if (req.body.totalAfterDiscount) {
      finalTotal = subTotal - req.body.totalAfterDiscount;
    } else {
      finalTotal = subTotal;
    }

    

    if (paymentMethod == "cashondelivery") {
      if (cartData.length > 0) {
        const order = new Order({
          owner: userData1._id,
          items: cartItems,
          shippingAddress: req.body.address1,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: paymentMethod,
          dateOrdered: req.body.dateOrdered,

          discountAmt:req.body.totalAfterDiscount,
          coupon:req.body.search

        });

        await order.save();
        user.cart = []; //emptying the cart
        await user.save();

        res.render("users/ordersuccess", { userData: req.session.userdata });
      } else {
        res.redirect("/shop");
      }
    } else {
      if (cartData.length > 0) {
        const order = new Order({
          owner: userData1._id,
          items: cartItems,
          shippingAddress: req.body.address1,
          totalBill: finalTotal,
          status: req.body.status,
          paymentMode: "razorpay",
          dateOrdered: req.body.dateOrdered,

          
          discountAmt:req.body.totalAfterDiscount,
          coupon:req.body.search
        });


        await order.save();
        user.cart = []; //emptying the cart
        const orderid = order._id; //check
        await user.save();

        res.render("users/razorpaypreview", {
          userData1,
          totalbill: finalTotal,
          cartData,
          orderId: orderid,
        });
      } else {
        res.redirect("/shop");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};





//PLACE ORDER   WORKING

// const placeOrder = async (req, res) => {
//   try {
//     const userData1 = req.session.userdata;

//     const user = await User.findOne({ _id: userData1._id }).populate(
//       "cart.product_id"
//     ); //populating User model's cart array with product_id
//     const cartData = user.cart; //check in model

//     const paymentMethod = req.body.pay;
//     await Address.findOne({ _id: req.body.address1 });

//     const cartItems = cartData.map((item) => {
//       return {
//         product_id: item.product_id, //product_id frm order model, to show diff items in an order
//         quantity: item.quantity,
//       };
//     });


//      //TOTAL AFTER DISCOUNT
//     let finalTotal;
//     if (req.body.totalAfterDiscount) {
//       finalTotal = subTotal - req.body.totalAfterDiscount;
//     } else {
//       finalTotal = subTotal;
//     }

//     if (paymentMethod == "cashondelivery") {
//       if (cartData.length > 0) {
//         const order = new Order({
//           owner: userData1._id,
//           items: cartItems,
//           shippingAddress: req.body.address1,
//           totalBill: finalTotal,
//           status: req.body.status,
//           paymentMode: paymentMethod,
//           dateOrdered: req.body.dateOrdered,
//         });

//         await order.save();
//         user.cart = []; //emptying the cart
//         await user.save();

//         res.render("users/ordersuccess", { userData: req.session.userdata });
//       } else {
//         res.redirect("/shop");
//       }
//     } else {
//       if (cartData.length > 0) {
//         const order = new Order({
//           owner: userData1._id,
//           items: cartItems,
//           shippingAddress: req.body.address1,
//           totalBill: finalTotal,
//           status: req.body.status,
//           paymentMode: "razorpay",
//           dateOrdered: req.body.dateOrdered,
//         });

//         console.log("thisizzorderrrrrrrrrrrrrr", order);

//         await order.save();
//         user.cart = []; //emptying the cart
//         const orderid = order._id; //check
//         await user.save();

//         res.render("users/razorpaypreview", {
//           userData1,
//           totalbill: finalTotal,
//           cartData,
//           orderId: orderid,
//         });
//       } else {
//         res.redirect("/shop");
//       }
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

//PAYMENT

const orderPayment = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { amount } = req.body; //check
    console.log("amount" + amount);

    let options = {
      amount: amount, // amount in the smallest currency unit req.body.amount
      currency: "INR",
      receipt: "rcp1",
    };
    instance.orders.create(options, function (err, order) {
      console.log(order);
      res.send({ orderId: order.id }); //extract id value and send to checkout
    });
  } catch (error) {
    console.log(error.message);
  }
};

//PAYMENT VERIFY

const paymentverify = async (req, res) => {
  let body =
    req.body.response.razorpay_order_id +
    "|" +
    req.body.response.razorpay_payment_id;

  let crypto = require("crypto");
  let expectedSignature = crypto
    .createHmac("sha256", "GRmORCyd375pS5XzZjVS4Rlz")
    .update(body.toString())
    .digest("hex");
  console.log("sig received ", req.body.response.razorpay_signature);
  console.log("sig generated ", expectedSignature);
  let response = { signatureIsValid: "false" };
  if (expectedSignature === req.body.response.razorpay_signature)
    response = { signatureIsValid: "true" };
  res.send(response);
};

//ORDER SUCCESS
const loadOrderSuccess = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    res.render("users/ordersuccess", { userData1 });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  viewCart,
  addToCart,
  cartOperation,
  deleteFromCart,
  couponCheck,
  loadCheckout,
  loadOrderSuccess,
  placeOrder,
  orderPayment,
  paymentverify,
};
