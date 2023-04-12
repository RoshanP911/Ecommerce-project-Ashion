require("dotenv").config();
const express = require("express");
const hbs = require("hbs"); 
const session = require("express-session");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const nocache = require("nocache");
const sharp = require('sharp')


// const multer = require("multer");
const config = require("./config/config");
const createError = require("http-errors");

//MONGOOSE CONNECT
const dbconnect = require("./config/dbConnect");
dbconnect();

//setting routes
const adminRouter = require("./routes/adminRoute");
const usersRouter = require("./routes/userRoute");


app.use(nocache()); //to clear cache
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); //Register your public folder to express in your .js file by


app.use(
  session({
    secret: config.sessionSecret,
    saveUnintialized: true,
    cookie: { maxAge: 600000 },
    resave: false
  })
);

// VIEW ENGINE SETUP
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

//PARTIALS ROUTE SETTING
const partialsPath = path.join(__dirname + "/views/partials");
hbs.registerPartials(partialsPath);

//MAIN ROUTES
app.use("/admin", adminRouter); //for admin routes
app.use("/", usersRouter); //for user routes

app.get("*",(req,res)=>{
  res.render("users/error");  
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//shharrp
hbs.registerHelper('crop', function(imageUrl, width, height) {
  const image = sharp(imageUrl);
  return image
    .metadata()
    .then(metadata => {
      const targetWidth = Math.min(width, metadata.width);
      const targetHeight = Math.min(height, metadata.height);
      return image
        .resize(targetWidth, targetHeight)
        .crop(sharp.gravity.center)
        .toBuffer();
    })
    .then(buffer => {
      return `<img src="data:image/jpeg;base64,${buffer.toString('base64')}" width="${width}" height="${height}" />`;
    });
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});






//HELPERS
hbs.registerHelper("calcTotal", function (quantity, price) {
  return "" + quantity * price;
});

hbs.registerHelper("eq", function (a, b) {
  return a === b;
});


hbs.registerHelper("or", function (x,y) {
  return x || y;
})

hbs.registerHelper('formatDate', function(date, format) {
  const options = {
   
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Kolkata'
  };
  const formattedDate = new Date(date).toLocaleString('en-US', options);
  return formattedDate;
});

//PORT SETTING
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
