const User = require("../models/userModel"); //mongodb user model
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
 const moment = require("moment");
const hbs = require("hbs");
const ExcelJS = require('exceljs');


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
  const totalRevenue = allOrders.reduce(
    (total, order) => total + Number(order.totalBill),
    0
  );

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


  const reports = async (req, res) => {
    try {
      const ordersdata = await Order.find().populate('items.product_id').sort({ dateOrdered: -1 })
      res.render('admin/salesreport', { orders: ordersdata })
  
    } catch (error) {
      console.error(error.message);
    }
  }


  
  let monthlyorderdata
  const getorders = async (req, res) => {
    try {
      const fromdate = req.body.fromDate
      const toDate = req.body.toDate

      monthlyorderdata = await Order.find({ dateOrdered: { $gte: fromdate, $lte: toDate } }).populate('items.product_id').sort({ dateOrdered: -1 })
      
      res.json({ orderdata: monthlyorderdata })
    } catch (error) {
      console.log(error.message);
    }
  }
  

  //EXCEL FILE DOWNLOAD
  const excelDownload = async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Data");
  
   // Add headers to the worksheet
    worksheet.columns = [
      { header: "Order ID", key: "_id", width: 30 },
      { header: "Order Date", key: "orderdate", width: 15 },
      { header: "Total Bill", key: "totalBill", width: 10 },
      { header: "totalOrders", key: "totalOrders", width: 10 },
      { header: "totalRevenue", key: "totalRevenue", width: 20 },
    ];

    let sum = 0
    monthlyorderdata.forEach(element => {
      sum += Number(element.totalBill)
    });
  
    monthlyorderdata.forEach((order) => {
      worksheet.addRow({
        _id: order._id,
        orderdate: order.dateOrdered,
        totalBill: order.totalBill,
      });
    });

    worksheet.addRow({
      totalOrders: monthlyorderdata.length,
      totalRevenue: sum,
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "SalesData.xlsx"
    );
  
    workbook.xlsx
      .write(res)
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("An error occurred while generating the Excel file");
      });
  };

  module.exports = {
  homeload,
  reports,
  getorders,
  excelDownload
  }

