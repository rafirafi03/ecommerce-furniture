const user = require("../../models/userModel");
const userAddress = require("../../models/adressModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const bcryptjs = require('bcryptjs');
const ejs = require('ejs');
const path = require('path');
const puppeteer = require('puppeteer');


const loadProfile = async (req, res) => {
  const userId = req.session.user_id;

  const users = await user.findOne({ _id: userId });
  const address = await userAddress.findOne({ user: userId });
  const orders = await orderModel.find({ user: userId }).populate('product.productId');
  orders.sort(function (a, b) {
    return new Date(b.orderDate) - new Date(a.orderDate);
  });
  try {
    res.render("user/profile", { users, address, orders });
  } catch (error) {
    console.log(error.message);
  }
};

const editProfile = async (req, res) => {
  try {
    const userData = req.session.user_id;
    const data = await user.findOneAndUpdate(
      { _id: userData },
      {
        $set: {
          name: req.body.name,
          mobile: req.body.mobile,
        },
      },
      { new: true }
    );
    res.json({ ok: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).render("500");
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const address = {
      fullName: req.body.fullName,
      address: req.body.address,
      email: req.body.email,
      mobile: req.body.mobile,
      country: req.body.country,
      state: req.body.state,
      district: req.body.district,
      pincode: req.body.pincode,
    };

    const findAddress = await userAddress.findOneAndUpdate(
      { user: userId },
      { $push: { address: address } },
      { upsert: true, new: true }
    );

    res.json({ add: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ add: false });
  }
};

const editAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.body.addressId;

    let {
      fullName,
      address,
      email,
      mobile,
      country,
      state,
      district,
      pincode,
    } = req.body;

    await userAddress.findOneAndUpdate(     
      { "user": userId, "address._id": addressId },
      {
          "$set": {
              "address.$.fullName": fullName,
              "address.$.country": country,
              "address.$.address": address,
              "address.$.district": district,
              "address.$.state": state,
              "address.$.pincode": pincode,
              "address.$.mobile": mobile,
              "address.$.email": email
          }
      }
  );

    res.json({edit:true})
  } catch (error) {
    console.log(error.message);
  }
};

// Other controller methods...

const removeAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const addressId = req.params.addressId;

    // Remove the address from the user's address array
    await userAddress.findOneAndUpdate(
      { user: userId },
      { $pull: { address: { _id: addressId } } },
      { new: true }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error("Error deleting address:", error);
    res.sendStatus(500);
  }
};

const PatchResetPass = async (req, res) => {

  try {
    const userId = req.session.user_id;

  const users =  await user.findOne({ _id: userId });

  let { currentPass, newPass } = req.body.data;

  const passwordCompare = await bcryptjs.compare(currentPass, users.password);

  if (currentPass === newPass) {
    res.json({exist:true})
  } else {
    if (passwordCompare) {
      const saltRounds = 10;
      console.log('yessss')
      
      bcryptjs.hash(newPass, saltRounds).then(async (hashedPassword) => {
  
        await user.findOneAndUpdate(
          { _id: userId },
          { password: hashedPassword }
        );
      });
  
      res.json({add:true});
    } else {
      res.json({add:false});
    }
  }

  
  } catch (error) {
    console.log(error.message)
  }
  

  
};

const loadOrderDetails = async (req, res) => {
  try {
    const orderId = req.query.id;
    const orders = await orderModel
      .findOne({ _id: orderId })
      .populate("product.productId");
    res.render("user/orderDetail", { orders });
  } catch (error) {
    console.log(error.message);
  }
};

const invoice = async (req,res)=> {
  try {

    const orderId = req.query.id;

    const orders = await orderModel.findOne({_id:orderId}).populate('product.productId');
      
      const ejsPagePath = path.join(__dirname, '../../views/user/orderInvoice.ejs');
      const ejsPage = await ejs.renderFile(ejsPagePath,{orders});
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(ejsPage);
      const pdfBuffer = await page.pdf();
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
      res.send(pdfBuffer);

  } catch (error) {
      console.log(error.message)
  }
}

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.id;

    const userId = req.session.user_id;

    const ordersProducts = await orderModel.findOne({ _id: orderId });

    await orderModel.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          orderStatus: "Cancelled", 
          "product.$[].orderStatus": "Cancelled" 
        }
      }
    );

    for (let i = 0; i < ordersProducts.product.length; i++) {
      let productId = ordersProducts.product[i].productId;
      let prdctQuantity = ordersProducts.product[i].quantity;

      await productModel.findOneAndUpdate(
        { _id: productId },
        { $inc: { quantity: prdctQuantity } }
      );
    }

    if (ordersProducts.payment !== 'cash on delivery') {
      await user.findOneAndUpdate(
          { _id: userId },
          {
              $inc: { wallet: ordersProducts.totalPrice },
              $push: {
                  walletHistory : {
                      date: Date.now(),
                      amount: ordersProducts.totalPrice
                  }
              }
          },
          { new: true } 
      );
  }



    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const returnProduct = async (req,res)=>{

  try {

    let {productId,orderId,reason} = req.body;

    console.log(req.body)

    const updatedOrder = await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        'product.productId': productId
      },
      {
        $set: {
          'product.$[prod].orderStatus': 'return requested',
          'product.$[prod].returnReason': reason
        }
      },
      {
        arrayFilters: [{ 'prod.productId': productId }],
        new: true 
      }
    );

      res.json({return:true})


  } catch (error) {
    console.log(error.message)
  }
}

const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadProfile,
  logout,
  editProfile,
  addAddress,
  editAddress,
  removeAddress,
  cancelOrder,
  loadOrderDetails,
  PatchResetPass,
  returnProduct,
  invoice
};
