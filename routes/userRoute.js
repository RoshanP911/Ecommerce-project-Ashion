const express = require("express");
const userRoute = express.Router();

// const config = require("../config/config");

const {userLoggedIn,userLoggedOut,blockCheck} =require("../middlewares/userAuth") 

const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");

//LOGIN
userRoute.get("/login", userLoggedOut,userController.userLogin);
userRoute.post("/login", userLoggedOut,userController.verifyLogin);
userRoute.get("/signup", userLoggedOut, userController.userSignup);
userRoute.post("/signup", userLoggedOut,userController.createUser);
userRoute.get("/otp", userLoggedOut, userController.loadotp);
userRoute.post("/otp", userLoggedOut,userController.otpsubmit);

//GENERAL
userRoute.get("/", userController.general);
userRoute.get("/home", userController.loadHome);
userRoute.get("/shop", userController.loadShop);
userRoute.get("/productdetails", userController.loadDetails);
userRoute.post("/productdetails", cartController.addToCart);
//userRoute.get('/cat_filter', userController.categoryFilter)
userRoute.get('/search',userController.search)
userRoute.get('/sort',userController.sort)
userRoute.get('/interconnect',userController.interConnect)


//USER
userRoute.get("/profile", userLoggedIn,blockCheck,   userController.loadProfile);
userRoute.get("/editprofile", userLoggedIn,blockCheck, userController.loadEditProfile);
userRoute.post("/editprofile", userLoggedIn,blockCheck,  userController.editProfile);

//ADDRESS
userRoute.get("/address", userLoggedIn,blockCheck,  userController.loadAddress);
userRoute.get("/addaddress", userLoggedIn,blockCheck, userController.loadAddAddress);
userRoute.post("/addaddress", userLoggedIn,blockCheck, userController.addAddress);
userRoute.get("/editaddress", userLoggedIn,blockCheck,  userController.loadEditAddress);
userRoute.post("/editaddress", userLoggedIn,blockCheck,  userController.editAddress);
userRoute.get('/deleteaddress', userLoggedIn,blockCheck,  userController.deleteAddress)

//ORDER
userRoute.get("/orderhistory",userLoggedIn,blockCheck,  userController.orderHistory);
userRoute.get("/orderhistorydetails", userLoggedIn,blockCheck,  userController.orderHistoryDetails);
userRoute.post("/ordercancel",userLoggedIn,blockCheck, userController.orderCancel)
userRoute.post("/orderreturn",userLoggedIn,userController.orderReturn)
userRoute.get('/ordersuccess', userLoggedIn,blockCheck,  cartController.loadOrderSuccess)
userRoute.get("/cart", userLoggedIn,blockCheck,  cartController.viewCart);
userRoute.post("/cart-operation", userLoggedIn,blockCheck,  cartController.cartOperation)
userRoute.get("/deletecart",userLoggedIn,blockCheck,  cartController.deleteFromCart)
userRoute.get("/checkout", userLoggedIn,blockCheck,  cartController.loadCheckout);
userRoute.post('/checkout', userLoggedIn,blockCheck,  cartController.placeOrder)
userRoute.get('/downloadinvoice', userLoggedIn, userController.invoiceDownload);

userRoute.get('/coupon', userLoggedIn,blockCheck, cartController.couponCheck)
userRoute.post('/create/orderId', userLoggedIn,blockCheck, cartController.orderPayment)
userRoute.post('/api/payment/verify', userLoggedIn,blockCheck, cartController.paymentverify)

userRoute.get("/logout", userLoggedIn, userController.userlogout);





//userRoute.get("/test", userController.test);   //FOR ZOOM
//userRoute.get("/test1", userController.test1);   //FOR fetCh
// userRoute.get('error',userController.loadError)


module.exports = userRoute;
