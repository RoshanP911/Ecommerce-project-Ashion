const express = require('express');
const adminRoute = express.Router();


// const auth=require('../middlewares/adminAuth') //
const {adminLoggedIn}=require('../middlewares/adminAuth')

const adminController=require('../controllers/adminController')
const categoryController=require('../controllers/categoryController')
const productController=require('../controllers/productController');
const dashboardController=require('../controllers/dashboardController');

const store = require('../middlewares/multer');

adminRoute.get('/',adminController.adminLogin)  //'admin/'
adminRoute.post('/',adminController.verifyAdmin)
adminRoute.get('/users', adminLoggedIn,adminController.loadUsers)
// adminRoute.get('/dashboard', adminLoggedIn,adminController.loadDashboard)

adminRoute.get('/dashboard', adminLoggedIn,dashboardController.homeload)
adminRoute.get('/salesreport', adminLoggedIn,dashboardController.reports)
adminRoute.post('/getOrders', adminLoggedIn,dashboardController.getorders)
adminRoute.get('/excelDownload', adminLoggedIn,dashboardController.excelDownload)


//adminRoute.get('/salesreport', adminLoggedIn,dashboardController.salesreport)



adminRoute.get('/block/:id', adminLoggedIn,adminController.blockUser)
adminRoute.get('/logout',  adminLoggedIn,adminController.adminlogout)


adminRoute.get('/category', adminLoggedIn,categoryController.listCategory)
adminRoute.get('/addcategory', adminLoggedIn,categoryController.loadAddCategory)
adminRoute.post('/addcategory', adminLoggedIn,store.store.single('image'),categoryController.insertCategory)
adminRoute.get('/editcategory', adminLoggedIn,categoryController.loadEditCategory)
adminRoute.post('/editcategory', adminLoggedIn,store.store.single('image'),categoryController.updateCategory)
adminRoute.get('/deletecategory', adminLoggedIn,categoryController.deleteCategory)


adminRoute.get('/product', adminLoggedIn,productController.listProduct)
adminRoute.get('/addproduct', adminLoggedIn,productController.loadAddProduct)
adminRoute.post('/addproduct', adminLoggedIn,store.store.array('image',8),store.sharpImage , productController.addProduct)
adminRoute.get('/editproduct', adminLoggedIn,productController.loadEditProduct)
adminRoute.post('/editproduct', adminLoggedIn,store.store.array('image',8),store.sharpImage, productController.editProduct)
adminRoute.get('/blockproduct/:id', adminLoggedIn,productController.blockProduct)
adminRoute.delete('/proimgdelete', adminLoggedIn, productController.deleteProdImage)

adminRoute.get('/order', adminLoggedIn,adminController.orderHistory)
adminRoute.get('/orderdetails', adminLoggedIn,adminController.orderHistoryInside)
adminRoute.post('/orderdetails', adminLoggedIn,adminController.orderHistoryStatusChange)



adminRoute.get('/addcoupon', adminLoggedIn,adminController.loadAddCoupon)
adminRoute.post('/addcoupon', adminLoggedIn,adminController.addCoupon)
adminRoute.get('/coupon', adminLoggedIn,adminController.couponList)



module.exports = adminRoute;    

