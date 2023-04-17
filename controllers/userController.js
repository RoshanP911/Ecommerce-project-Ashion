const User = require("../models/userModel"); //mongodb user model
const Product = require("../models/productModel");
const Address = require("../models/addressModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const argon2 = require("argon2");
const nodemailer = require("nodemailer"); //email handler
const dotenv = require("dotenv");
const { findByIdAndUpdate } = require("../models/userModel");
require("dotenv").config();
const PDFDocument = require("pdfkit");

const moment = require("moment");

let userRegData;

const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

// GENERAL
const general = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const categories = await Category.find();
    res.render("users/home", { categories, userData1 });
  } catch (error) {
    console.log(error.message);
  }
};

//USER LOGIN
const userLogin = async (req, res) => {
  try {
    const categories = await Category.find();

    res.render("users/login", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

//USER SIGNUP LOADING
const userSignup = async (req, res) => {
  try {
    const categories = await Category.find();

    res.render("users/signup", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

//NEW USER REGISTRATION
const createUser = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    userRegData = req.body;

    const existUser = await User.findOne({ email: email });

    if (existUser == null) {
      await sendMail(name, email); //global variable

      res.redirect("/otp");

      console.log(name, email);
      console.log(otp, enteredotp);
    } else {
      if (existUser.email == email) {
        res.render("users/signup", { message: "Email already exist" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//USER LOGIN VERIFICATION
const verifyLogin = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;

    const userData = await User.findOne({ email: email });

    const categories = await Category.find();

    if (userData) {
      var passwordMatch = await argon2.verify(userData.password, password);

      if (passwordMatch) {
        const is_blocked = userData.is_blocked;
        if (!is_blocked) {
          req.session.userdata = userData;

          res.redirect("/home"); //
        } else {
          res.render("users/login", {
            categories,
            message: "Unauthorised access",
          });
        }
      } else {
        res.render("users/login", {
          categories,
          message: "Password is incorrect",
        });
      }
    } else {
      res.render("users/login", {
        categories,
        message: "Email or Password is incorrect",
      });
    }
    // }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD OTP
const loadotp = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("users/otp", { categories });
  } catch (error) {
    console.log(error.message);
  }
};

//USER HOME LOAD
const loadHome = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const categories = await Category.find();
    res.render("users/home", { userData1, categories });
  } catch (error) {
    console.log(error.message);
  }
};

//USER LOGIN VERIFICATION
const otpsubmit = async (req, res) => {
  // const spassword=await securePassword(userRegData.password);
  const spassword = await argon2.hash(userRegData.password);
  const enteredotp = req.body.otp;

  if (enteredotp == otp) {
    const user = new User({
      name: userRegData.name,
      mobile: userRegData.mobile,
      email: userRegData.email,
      password: spassword,
      is_blocked: 0,
      is_verified: 0,
    });
    const userData = await user.save();
    res.render("users/signup", {
      message: "Registration successful Please login",
    });
  } else {
    res.render("users/otp", { message: "Invalid otp" });
  }
};

//USER OTP VERIFICATION

const sendMail = async (_id, email) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailoption = {
      from: "roshanprashanth@gmail.com",
      to: email,
      subject: " OTP Verification mail",
      text: `hello your otp is ${otp}`,
    };

    transporter.sendMail(mailoption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("email has been sent", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//SHOP BY CATEGORY
const shopByCategory = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const categoryId = req.body.id;
    const categories = await Category.find();
    const shopData = await Product.find({
      category: categoryId,
      is_blocked: false,
    });

    res.json({ shopData, categories, userData1 });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ALL PRODUCTS
const loadShop = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const categories = await Category.find();
    const options = {
      page: req.query.page || 1, // get current page number from query params
      limit: 8,
    };

    const result = await Product.paginate({}, options);

    res.render("users/shop", {
      productData: result,
      userData1,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//INTERCONNECTING CATEGORY, SEARCH, SORT first linking cat filter and search
const interConnect = async (req, res) => {
  try {
    const catId = req.body.categoryId;
    const shopData = await Product.find({ category: catId, is_blocked: false });
    res.json({ shopData });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

//SEARCH
const search = async (req, res) => {
  try {
    let search = "";
    search = req.body.searchval.trim();

    const catId = req.body.categoryId;
    if (catId) {
      const shopData = await Product.find({
        is_blocked: false,
        $or: [
          {
            category: catId,
            name: { $regex: ".*" + search + ".*", $options: "i" },
          },
        ],
      });
      res.json({ shopData });
    } else {
      const shopData = await Product.find({
        is_blocked: false,
        $or: [{ name: { $regex: ".*" + search + ".*", $options: "i" } }],
      });
      res.json({ shopData });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Server error" });
  }
};

//SORT
const sort = async (req, res) => {
  try {
    const { id, categoryId } = req.body;
    let productData;
    if (id === "aToZ") {
      if (categoryId) {
        productData = await Product.find(
          { category: categoryId },
          { is_blocked: false }
        ).sort({ name: 1 });
      } else {
        productData = await Product.find({ is_blocked: false }).sort({
          name: 1,
        });
      }
    } else if (id === "zToA") {
      if (categoryId) {
        productData = await Product.find(
          { category: categoryId },
          { is_blocked: false }
        ).sort({ name: -1 });
      } else {
        productData = await Product.find({ is_blocked: false }).sort({
          name: -1,
        });
      }
    } else if (id === "price-low-to-high") {
      if (categoryId) {
        productData = await Product.find(
          { category: categoryId },
          { is_blocked: false }
        ).sort({ price: 1 });
      } else {
        productData = await Product.find({ is_blocked: false }).sort({
          price: 1,
        });
      }
    } else if (id === "price-high-to-low") {
      if (categoryId) {
        productData = await Product.find(
          { category: categoryId },
          { is_blocked: false }
        ).sort({ price: -1 });
      } else {
        productData = await Product.find({ is_blocked: false }).sort({
          price: -1,
        });
      }
    } else if (id === "default") {
      productData = await Product.find({ is_blocked: false });
    } else {
      return res.status(400).json({ error: "Invalid sort parameter" });
    }

    res.json({ productData });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//PRODUCT DETAILS LOAD
const loadDetails = async (req, res) => {
  try {
    const categories = await Category.find();
    const userData1 = req.session.userdata;
    const id = req.query.id;
    let productData = await Product.findById(id);
    res.render("users/productdetails", {
      productData: productData,
      userData1,
      categories,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//USER PROFILE LOAD
const loadProfile = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const id = userData1._id;

    const userData = await User.findById(id);

    if (userData.is_blocked) {
      res.redirect("/logout");
    } else {
      const categories = await Category.find();

      const id = req.query.id;
      const userData = await User.findById(id);

      res.render("users/profile", {
        userData: userData,
        userData1,
        categories,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD PROFILE EDIT
const loadEditProfile = async (req, res) => {
  try {
    const userData1 = req.session.userdata;

    const id = req.query.id;
    const userData = await User.findById(id);

    res.render("users/editprofile", {
      userData: userData,
      userData1,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//USER PROFILE EDIT
const editProfile = async (req, res) => {
  try {
    const userData1 = req.session.userdata;

    const id = req.body.id;
    const userData = await User.findByIdAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        email: req.body.mail,
        mobile: req.body.mobile,
      },
      { new: true }
    );

    res.render("users/profile", { userData: userData, userData1 });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADDRESSES
const loadAddress = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const addressData = await Address.find({ owner: userData1._id });

    res.render("users/address", {
      userData1,
      addressData: addressData,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADD ADDRESS
const loadAddAddress = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    res.render("users/addaddress", { userData1 });
  } catch (error) {
    console.log(error.message);
  }
};

//POST ADD ADDRESS
const addAddress = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    if (
      //null validation
      Object.values(req.body).some(
        (value) => !value.trim() || value.trim().length === 0
      )
    ) {
      res.render("users/addaddress", { message1: "please fill the field" });
    } else {
      const address = new Address({
        owner: userData1._id,
        name: req.body.name,
        mobile: req.body.mobile,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        pin: req.body.pin,
        country: req.body.country,
      });
      const addressData = await address.save();
      if (addressData) {
        res.redirect("/address");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD EDIT ADDRESS
const loadEditAddress = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const id = req.query.id;
    const addressData = await Address.findById(id);

    console.log("addressData");
    console.log(addressData);
    res.render("users/editaddress", { userData1, addressData });
  } catch (error) {
    console.log(error.message);
  }
};

//EDIT ADDRESS
const editAddress = async (req, res) => {
  try {
    const id = req.body.id;
    await Address.findByIdAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        mobile: req.body.mobile,
        address1: req.body.address1,
        address2: req.body.address2,
        city: req.body.city,
        state: req.body.state,
        pin: req.body.pin,
        country: req.body.country,
      },
      { new: true }
    );
    res.redirect("/address");
  } catch (error) {
    console.log(error.message);
  }
};

//DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    const id = req.query.id;
    await Address.findByIdAndDelete({ _id: id });
    res.redirect("/address");
  } catch (error) {
    console.log(error.message);
  }
};

///ORDER HISTORY
const orderHistory = async (req, res) => {
  try {
    const userData1 = req.session.userdata;
    const orderData = await Order.find({ owner: userData1._id })
      .populate("items.product_id")
      .populate("shippingAddress")
      .sort({ dateOrdered: -1 });

    res.render("users/orderhistory", { userData1, orderData });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ORDER HISTORY DETAILS
const orderHistoryDetails = async (req, res) => {
  try {
    const userData1 = req.session.userdata;

    // const orderData = await Order.find({ owner: userData1._id }).populate('items.product_id').populate('shippingAddress')
    // console.log('this is zorerdata');
    // console.log(orderData);
    // console.log('this is zoorderdatas items');
    // const obj=orderData.items
    // console.log(obj);

    const id = req.query.id;
    const orderDetail = await Order.findById(id)
      .populate("items.product_id")
      .populate("shippingAddress")
      .populate("owner");
    //const itemsData = orderDetail.items;

    res.render("users/orderhistorydetails", {
      userData1,
      orderDetail,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//CANCEL ORDER
const orderCancel = async (req, res) => {
  try {
    const { id } = req.body;
    const updatedData = await Order.findByIdAndUpdate(
      { _id: id },
      { status: "cancelled" },
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    console.log(error.message);
  }
};

//RETURN ORDER
const orderReturn = async (req, res) => {
  try {
    const { id } = req.body;
    const updatedData = await Order.findByIdAndUpdate(
      { _id: id },
      { status: "returned" },
      { new: true }
    );
    res.json(updatedData);
  } catch (error) {
    console.log(error.message);
  }
};

//DOWNLOAD INVOICE
const invoiceDownload = async (req, res) => {
  try {
    const id = req.query.id;
    const order = await Order.findOne({ _id: id })
      .populate("items.product_id")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Create a new PDF document
    const doc = new PDFDocument({ font: "Helvetica" });

    // Set the response headers for downloading the PDF file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${order._id}.pdf"`
    );

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add the order details to the PDF document
    doc
      .fontSize(18)
      .text(`ASHION STORE INVOICE`, { align: "center", lineGap: 20 }); // increase line gap for better spacing

    doc.moveDown(2); // move down by 2 lines

    doc
      .fontSize(10)
      .text(`Order ID: ${order._id}`, { align: "left", lineGap: 10 }); // decrease line gap for tighter spacing
    doc.moveDown();
    doc.fontSize(12).text("Product Name", { width: 380, continued: true });
    doc
      .fontSize(12)
      .text("Price", { width: 100, align: "center", continued: true });
    doc.fontSize(12).text("Qty", { width: 50, align: "right" });
    doc.moveDown();

    let totalPrice = 0;
    order.items.forEach((item, index) => {
      doc
        .fontSize(12)
        .text(`${index + 1}. ${item.product_id.name}`, {
          width: 375,
          continued: true,
        });

      const totalCost = item.product_id.price * item.quantity;
      doc
        .fontSize(12)
        .text(`${totalCost}`, { width: 100, align: "center", continued: true });

      doc.fontSize(12).text(`${item.quantity}`, { width: 50, align: "right" });
      doc.moveDown();
      totalPrice += totalCost;
    });

    doc.moveDown(2); // move down by 2 lines

    doc.fontSize(12).text(`Subtotal: Rs ${totalPrice}`, { align: "right" });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Total Amount after discount: Rs ${order.totalBill}`, {
        align: "right",
      });
    doc.moveDown();
    doc.fontSize(12).text(
      `Ordered Date: ${order.dateOrdered.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })} ${order.dateOrdered.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })}`,
      { lineGap: 10 } // increase line gap for better spacing
    );
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Payment Method: ${order.paymentMode}`, { lineGap: 10 });
    doc.moveDown();
    doc.fontSize(12).text(`Coupon : ${order.coupon}`, { lineGap: 10 });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Discount Amount : ${order.discountAmt}`, { lineGap: 10 });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(
        `Shipping Address:\n ${order.shippingAddress.name},\n${order.shippingAddress.mobile},\n${order.shippingAddress.address1},\n${order.shippingAddress.address2},\n${order.shippingAddress.city}`,
        { lineGap: 10 }
      );
    doc.moveDown();
    doc.fontSize(12).text(`Order Status: ${order.status}`, { lineGap: 10 });

    doc.moveDown(2); // move down by 2 lines

    doc
      .fontSize(14)
      .text("Thank you for purchasing with us!", {
        align: "center",
        lineGap: 20,
      });

    doc.moveDown(); // move down by 1 line

    // End the PDF document
    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

//USER LOGOUT
const userlogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  general,
  userLogin,
  userSignup,
  verifyLogin,
  loadotp,
  createUser,
  otpsubmit,
  loadHome,
  sendMail,
  shopByCategory,
  loadDetails,
  loadShop,
  interConnect,
  search,
  sort,
  loadProfile,
  loadEditProfile,
  editProfile,
  loadAddress,
  loadAddAddress,
  addAddress,
  loadEditAddress,
  editAddress,
  deleteAddress,
  orderHistory,
  orderHistoryDetails,
  orderCancel,
  orderReturn,
  invoiceDownload,
  userlogout,
};
