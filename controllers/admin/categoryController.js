// requiring the category model.
const category = require('../../models/categoryModel');

  // Code for load the category page.
  const loadCategory = async (req, res) => {
    try {
      const Category = await category.find({});
      res.render("admin/category", { page: "category", Category });
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // Code for load the add category page.
  const loadAddCategory = async (req, res) => {
    try {
      res.render("admin/addCategory");
    } catch (error) {
      console.log(error.message);
    }
  };
  
  // Code for post the add category request.
  const postAddcategory = async (req, res) => {
    let { name, description } = req.body;
    const categoryExists = await category.findOne({ name });
  
    if (categoryExists) {
      res.render("admin/addCategory", {
        message: "This Category already exists.",
      });
    } else {
      const Category = await new category({
        name: name,
        description: description,
      });
      const result = await Category.save();
      res.redirect("/admin/category");
    }
  };
  
  // Code for load the edit category page.
  const loadEditCategory = async (req,res) => {
    try {
      const id = req.query.id;
      const Category = await category.findOne({_id:id})
      res.render('admin/editCategory',{Category})
    } catch (error) {
      console.log(error.message);
    }
  }
  
  // Code for post the edit Category request.
  const postEditCategory = async (req,res) => {
    let {name, description, _id} = req.body;
      
      const categoryExists = await category.findOne({name}); 
  
      if (categoryExists) {
  
        res.render('admin/editCategory', {
          message: "This category already exists.",
          Category:category
        })
      } else{
  
        await category.findOneAndUpdate(
          {_id: _id},
          {
            name: name,
            description: description
          }
          )
  
          res.redirect("/admin/category");
  
      }
  }
  // Code for list the cateogry.
  const listCategory = async (req, res) => {
    try {
      const { id } = req.params;
      const category1 = await category.findOne({ _id: id });
      if (category1.isListed) {
        category1.isListed = false;
      } else {
        category1.isListed = true;
      }
      await category1.save();
      res.status(200).json({ message: "true" });
    } catch (error) {
      console.log(error);
    }
  };

  module.exports = {
    loadCategory,
    loadAddCategory,
    postAddcategory,
    loadEditCategory,
    postEditCategory,
    listCategory
  }