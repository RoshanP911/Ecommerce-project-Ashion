const User = require("../models/userModel");
//IF USER LOGGED IN
const userLoggedIn = async (req, res, next) => {
  try {
    if (req.session.userdata) {
      next();
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//TO CHECK IF USER IS BLOCKED
const blockCheck = async (req, res, next) => {
  const userData1 = req.session.userdata;
  const id = userData1._id;
  const userData = await User.findById(id);
  if (userData.is_blocked) {
    res.redirect("/logout");
  } else {
    next();
  }
};

//IF USER LOGGED OUT
const userLoggedOut = async (req, res, next) => {
  try {
    if (req.session.userdata) {
      return res.redirect("/");
    } else next();
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  userLoggedIn,
  userLoggedOut,
  blockCheck,
};
