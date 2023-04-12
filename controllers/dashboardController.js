const User = require("../models/userModel"); //mongodb user model
const Product = require("../models/productModel");
// const Address = require("../models/addressModel");
// const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
// const moment = require("moment");
const hbs = require("hbs");


//HELPER TO RETURN JSON OBJECT IN HBS
hbs.registerHelper("json", function (context) {
    return JSON.stringify(context);
  });


  const homeload = async (req, res) => {
try {
  const users = await User.find({}).count();
  const products = await Product.find({}).count();
  const orders = await Order.find({}).count();
  const allOrders = await Order.find({ status: "delivered" });
  console.log('allOrders')
  console.log(allOrders);
  const totalRevenue = allOrders.reduce(
    (total, order) => total + Number(order.totalBill),
    0
  );

  // console.log('total revenueeeeeeeeeeeeeeeeeeeeee')
  // console.log(totalRevenue);


  //category sales
    const categorysale = await Order.aggregate(
        [//
          {
            $lookup: {
              from: "addresses", // Name of the collection joining with
              localField: "address",
              foreignField: "_id",
              as: "address", // Name of the array field where the joined documents will be stored
            },
          },
          {
            $unwind: "$items", // Deconstruct the items array
          },
          {
            $lookup: {
              from: "products", // Name of the collection  joining with
              localField: "items.product_id",
              foreignField: "_id",
              as: "product_id", // Name of the array field where the joined documents will be stored
            },
          },
          {
            $unwind: "$product_id", // Deconstruct the product array
          },
           {
            $group: {
              _id: "$product_id.category",
              count: { $sum: 1 },
            },
          }, {
            $lookup: {
              from: "categories", // Name of the collection joining with
              localField: "_id",
              foreignField: "_id",
              as: "category", // Name of the array field where the joined documents will be stored
            },
          },
          {
            $unwind: "$category", // Deconstruct the category array
          },
          {
            $project: {
              _id: 0,
              category: "$category.name",
              count: 1,
            },
          },
        ],
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
          }
        }
      )
  
// console.log('categorysaleeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
// console.log(categorysale);



const cashOnDeliveryCount = await Order.countDocuments({
  paymentMode: "cashondelivery",
});


const razorPayCount = await Order.countDocuments({
  paymentMode: "razorpay",
});

const pipeline = [
  {
    $group: {
      _id: {
        year: { $year: "$dateOrdered" },
        month: { $month: "$dateOrdered" },
      },
      count: { $sum: 1 },
    },
  },
  {
    $project: {
      _id: 0,
      date: {
        $dateFromParts: {
          year: "$_id.year",
          month: "$_id.month",
          day: 1,
        },
      },
      count: 1,
    },
  },
  {
    $sort: {
      date: 1,
    },
  },
];

// console.log('cpipeeeeeeeeeeeeeeeeeeeel,ineeeeeeeee');
// console.log(pipeline);



const ordersByMonth = await Order.aggregate(pipeline);
const orderCounts = ordersByMonth.map(({ date, count }) => ({
  month: date.toLocaleString("default", { month: "long" }),
  count
}));

res.render("admin/dashboard", {
  cashOnDeliveryCount,
  razorPayCount,
  orderCounts,
  users,
  products,
  orders,
  totalRevenue,
  categorysale,
});


} catch (error) {
    console.log(error.message);
}
  }





  module.exports = {
  homeload
  }