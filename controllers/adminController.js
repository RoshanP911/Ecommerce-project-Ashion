const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const { findByIdAndUpdate } = require("../models/adminModel");
const moment = require('moment');

//LOAD ADMIN LOGIN
const adminLogin = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN DASHBOARD
const verifyAdmin = async (req, res) => {
  try {
    email = req.body.email;
    password = req.body.password;

    const adminData = await Admin.findOne({ email: email });

    if (adminData) {
      if (adminData.password == password) {
        req.session.admin = adminData._id;

        res.redirect("/admin/dashboard");
        // res.render("admin/dashboard")
      } else {
        res.render("admin/login", { message: "Password is incorrect" });
      }
    } else {
      res.render("admin/login", { message: "Email or Password is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADMIN DASHBOARD
const loadDashboard = async (req, res) => {
  try {
    if (req.session.admin) {
      res.render("admin/dashboard");
    }
  } catch (error) {
    console.log(error.message);
  }
};









//USERS LIST
const loadUsers = async (req, res) => {
  try {
    const userData = await User.find();
    res.render("admin/users", { users: userData });
  } catch (error) {
    console.log(error.message);
  }
};

//BLOCK USER
const blockUser = async (req, res) => {
  const blockid = req.params.id;
  const blockUserData = await User.findById(blockid);

  const block_status = blockUserData.is_blocked;
  try {

    await User.findByIdAndUpdate(
      blockid,
      { $set: { is_blocked: !block_status } },
      { new: true }
    );
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADD COUPON
const loadAddCoupon = async (req, res) => {
  try {
    // const couponData = await Coupon.find();
    res.render("admin/addcoupon");
  } catch (error) {
    console.log(error.message);
  }
};

//ADD COUPON
const addCoupon = async (req, res) => {
  try {
    if (  Object.values(req.body).some(
      (value) => !value.trim() || value.trim().length === 0
    )) {
      res.render("admin/addcoupon", { message: "please fill the field" });
    } else {
  
const inputDate = req.body.expiryDate; // assuming input is in yyyy-mm-dd hh:mm:ss format

    const coupon = new Coupon({
      code: req.body.code,
      discount: req.body.discount,
      expiryDate: inputDate,
      minBill: req.body.minBill,
      status: req.body.status
    });
    await coupon.save();
    res.redirect("/admin/coupon");
    }
    
  } catch (error) {
    console.log(error.message);
  }
};

// ORDER MANAGEMENT
const orderHistory = async (req, res) => {
  try {
    // const orderData = await Order.find({ owner: userData1._id }).populate('items.product_id').populate('shippingAddress')
    const orderData = await Order.find()
      .populate("items.product_id")
      .populate("shippingAddress")
      .sort({ dateOrdered: -1 });
 
    res.render("admin/order", { order: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN
const orderHistoryInside = async (req, res) => {
  try {
    const id = req.query.id;
    const orderDetail = await Order.findById(id)
      .populate("items.product_id")
      .populate("shippingAddress");

    res.render("admin/orderdetails", { orderDetail });
  } catch (error) {
    console.log(error.message);
  }
};

//ORDER STATUS CHANGE FOR ADMIN
const orderHistoryStatusChange = async (req, res) => {
  try {
    const orderId = req.body.id
const newStatus=req.body.status_change
    await Order.findByIdAndUpdate(orderId,{ $set: { status: newStatus } },{ new: true });
    res.redirect('back'); // used to redirect the user back to the previous page after the update is complete.
  } catch (error) {
    console.log(error.message);
  }
};


//LIST COUPON
const couponList = async (req, res) => {
  try {
    const couponData = await Coupon.find();
    res.render("admin/coupon", { couponData });
  } catch (error) {
    console.log(error.message);
  }
};

//ADMIN LOGOUT
const adminlogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  adminLogin,
  verifyAdmin,
  loadDashboard,
  
  loadUsers,
  adminlogout,
  blockUser,
  orderHistory,
  orderHistoryInside,
  orderHistoryStatusChange,
  loadAddCoupon,
  addCoupon,
  couponList,
};
