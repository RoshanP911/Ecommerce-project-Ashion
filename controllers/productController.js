const { findByIdAndUpdate, findById } = require("../models/productModel");
const Product = require("../models/productModel"); //mongodb category model
const Category = require("../models/categoryModel");
const fs= require('fs')

//LIST PRODUCTS
const listProduct = async (req, res) => {
  try {
    const productData = await Product.find().populate("category");
    res.render("admin/product", { product: productData });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADD PRODUCTS
const loadAddProduct = async (req, res) => {
  try {
    const categoryData = await Category.find();
    res.render("admin/addproduct", { categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

//ADD PRODUCT
const addProduct = async (req, res) => {
  try {

    if (Object.values(req.body).some(
      (value) => !value.trim() || value.trim().length === 0
    )) {
      res.render("admin/addproduct", { message1: "please fill the field" });
    } else {
      
    const name = req.body.name;
    const productData = await Product.findOne({ name: name });

    const images = [];
    const file = req.files;
    file.forEach((element) => {
      const image = element.filename;
      images.push(image);
    });
   

    //   const id=req.body._id

    if (productData == null) {
      const product = new Product({
        name: req.body.name,
        description: req.body.description,
        image: images,
        category: req.body.category,
        price: req.body.price,
        brand: req.body.brand,
        quantity: req.body.quantity,
        is_blocked: false,
      });
      await product.save();
      res.render("admin/addproduct", { message: "Product added successfully" });
    } else {
      if (productData.name == name)
        res.render("admin/addproduct", { message: "Product already exists" });
    }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD EDIT PRODUCT
const loadEditProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.find();
    const productData = await Product.findById({ _id: id });
    console.log('tthiiiiiiiisssssssss is proooooo daaaaaataaaaaa');
    console.log(productData);

    if (productData) {
      res.render("admin/editproduct", {
        product: productData,
        categoryData: categoryData,
      });
    } else {
      res.render("admin/product");
    }
  } catch (error) {
    console.log(error.message);
  }
};


//EDIT PRODUCT


//EDIT PRODUCT OLD
const editProduct = async (req, res) => {
  try {
    const id = req.query.id;
    // const categoryData = await Category.find();
    const productData = await Product.findById({ _id: id });
    const oldPhotosArray=productData.image


    let newArray=[]

    //images from body 
    const images = [];
    const file = req.files;
    file.forEach((element) => {
      const image = element.filename;
      images.push(image);
    });

//concatenating two arrays using spread operator
     newArray=[...oldPhotosArray,...images]
 

    await Product.findByIdAndUpdate(
      { _id: id },
      {
        name: req.body.name,
        description: req.body.description,
        image: newArray,
        category: req.body.category,
        price: req.body.price,
        brand: req.body.brand,
        quantity: req.body.quantity,
      },
      { new: true }
    );

    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};


//new delete single image 
const deleteProdImage=async(req,res)=>{
  try {

    const {id, image}=req.query
    const productData=await Product.findById(id)
    productData.image.splice(image,1)
    await productData.save()
    res.status(200).send({ message: 'Image deleted successfully' });

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}








//BLOCK PRODUCT
const blockProduct = async (req, res) => {
  const blockid = req.params.id;
  const blockProductData = await Product.findById(blockid);
  const block_status = blockProductData.is_blocked;
  try {
    await Product.findByIdAndUpdate(
      blockid,
      { $set: { is_blocked: !block_status } },
      { new: true }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  listProduct,
  loadAddProduct,
  addProduct,
  loadEditProduct,
  editProduct,
  deleteProdImage,
  blockProduct,
};
