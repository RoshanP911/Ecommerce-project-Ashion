const mongoose = require("mongoose");
const {
  findByIdAndUpdate,
  findByIdAndDelete,
} = require("../models/categoryModel");
const Category = require("../models/categoryModel"); //mongodb category model
const { findById } = require("../models/productModel");

//LIST CATEGORIES

const listCategory = async (req, res) => {
  try {
    const categoryData = await Category.find();
    res.render("admin/category", { category: categoryData });
  } catch (error) {
    console.log(error.message);
  }
};

//LOAD ADD CATEGORY FORM
const loadAddCategory = async (req, res) => {
  try {
    res.render("admin/addcategory");
  } catch (error) {
    console.log(error.message);
  }
};

//CREATE CATEGORY
const insertCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const nameLo = name.toLowerCase();
    const categoryData = await Category.findOne({ name: nameLo });

    if (categoryData) {
      res.render("admin/addcategory", { message1: "Category exists" });
    } else {
      const category = new Category({
        name: nameLo,
        image: req.file.filename,
      });
      const categoryy = await category.save();

   

      res.render("admin/addcategory", {
        message: "Category added successfully",
      });
    }
  } catch (error) {
    console.log(error.messaage);
  }
};

//LOAD EDIT CATEGORY
const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.findById({ _id: id });
    if (categoryData) {
      res.render("admin/editcategory", { category: categoryData }); //categoryData gets passed into html page while rendering in a variable 'category'. There category.xxx to be used to get values
    } else {
      res.redirect("admin/category");
    }
  } catch (error) {
    console.log(error.message);
  }
};



const updateCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const categoryData = await Category.find();
    const name = req.body.name;
    const nameLo = name.toLowerCase();

    const existingCategory = categoryData.find(
      category => category.name.toLowerCase() === nameLo && category._id != id
    );
    if (existingCategory) {
      return res.render("admin/editcategory", { message: "Category exists" });
    }


    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name: name, image: req.file.filename },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).render("admin/editcategory", { message: "Category not found" });
    }

    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error");
  }
};


//DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findByIdAndDelete({ _id: id });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  listCategory,
  loadAddCategory,
  insertCategory,
  loadEditCategory,
  updateCategory,
  deleteCategory,
};
