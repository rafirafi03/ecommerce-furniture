const user = require("../../models/userModel");
const userAddress = require("../../models/adressModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const bcryptjs = require("bcryptjs");
const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");

const loadProfile = async (req, res) => {
  const userId = req.session.user_id;

  const users = await user.findOne({ _id: userId });
  const address = await userAddress.findOne({ user: userId });
  const orders = await orderModel
    .find({ user: userId })
    .populate("product.productId");
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
      { user: userId, "address._id": addressId },
      {
        $set: {
          "address.$.fullName": fullName,
          "address.$.country": country,
          "address.$.address": address,
          "address.$.district": district,
          "address.$.state": state,
          "address.$.pincode": pincode,
          "address.$.mobile": mobile,
          "address.$.email": email,
        },
      }
    );

    res.json({ edit: true });
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

    const users = await user.findOne({ _id: userId });

    let { currentPass, newPass } = req.body.data;

    const passwordCompare = await bcryptjs.compare(currentPass, users.password);

    if (currentPass === newPass) {
      res.json({ exist: true });
    } else {
      if (passwordCompare) {
        const saltRounds = 10;
        console.log("yessss");

        bcryptjs.hash(newPass, saltRounds).then(async (hashedPassword) => {
          await user.findOneAndUpdate(
            { _id: userId },
            { password: hashedPassword }
          );
        });

        res.json({ add: true });
      } else {
        res.json({ add: false });
      }
    }
  } catch (error) {
    console.log(error.message);
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

const invoice = async (req, res) => {
  try {
    const orderId = req.query.id;

    const orders = await orderModel
      .findOne({ _id: orderId })
      .populate("product.productId");

    const ejsPagePath = path.join(
      __dirname,
      "../../views/user/orderInvoice.ejs"
    );
    const ejsPage = await ejs.renderFile(ejsPagePath, { orders });
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(ejsPage, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.end(pdfBuffer);
  } catch (error) {
    console.log(error.message);
  }
};

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
          "product.$[].orderStatus": "Cancelled",
        },
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

    if (ordersProducts.payment !== "cash on delivery") {
      await user.findOneAndUpdate(
        { _id: userId },
        {
          $inc: { wallet: ordersProducts.totalPrice },
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: ordersProducts.totalPrice,
            },
          },
        },
        { new: true }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelFailedOrder = async (req, res) => {
  try {
    const orderId = req.body.id;

    await orderModel.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          orderStatus: "Cancelled",
          "product.$[].orderStatus": "Cancelled",
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const cancelIndividualProduct = async (req, res) => {
  try {
    const { productId, orderId } = req.body;

    const order = await orderModel.findById(orderId);
    const product = await productModel.findById(productId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const userId = order.user;
    const productItem = order.product.find(
      (item) => item.productId.toString() === productId
    );

    console.log(productItem, "productItemmmmm 12345");

    if (!productItem)
      return res.status(404).json({ message: "Product not found in order" });
    if (productItem.orderStatus === "Cancelled")
      return res.status(400).json({ message: "Product already cancelled" });

    const refundAmount = product.price * productItem.quantity;

    console.log(refundAmount, "refundd amounttttt  123456");

    const updatedOrder = await orderModel.findOneAndUpdate(
      { _id: orderId, "product.productId": productId },
      {
        $set: {
          "product.$[prod].orderStatus": "Cancelled",
          "product.$[prod].paymentStatus": "refunded",
        },
        $inc: {
          totalPrice: -refundAmount,
        },
      },
      {
        arrayFilters: [{ "prod.productId": productId }],
        new: true,
      }
    );

    const allCancelled = updatedOrder.product.every(
      (item) => item.orderStatus === "Cancelled"
    );

    if (allCancelled) {
      await orderModel.findByIdAndUpdate(orderId, {
        $set: { orderStatus: "Cancelled" },
      });
    }

    await user.findByIdAndUpdate(userId, {
      $inc: { wallet: refundAmount },
      $push: {
        walletHistory: {
          amount: refundAmount,
          date: new Date(),
        },
      },
    });

    await productModel.findOneAndUpdate(
      { _id: productId },
      { $inc: { quantity: productItem.quantity } }
    );

    res.json({
      success: true,
      message: "Product cancelled and amount refunded",
      refundAmount,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const returnProduct = async (req, res) => {
  try {
    let { productId, orderId, reason } = req.body;

    console.log(req.body);

    await orderModel.findOneAndUpdate(
      {
        _id: orderId,
        "product.productId": productId,
      },
      {
        $set: {
          "product.$[prod].orderStatus": "return requested",
          "product.$[prod].returnReason": reason,
        },
      },
      {
        arrayFilters: [{ "prod.productId": productId }],
        new: true,
      }
    );

    res.json({ return: true });
  } catch (error) {
    console.log(error.message);
  }
};

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
  cancelFailedOrder,
  cancelIndividualProduct,
  loadOrderDetails,
  PatchResetPass,
  returnProduct,
  invoice,
};
