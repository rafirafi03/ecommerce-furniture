const cartModel = require("../../models/cartModel");
const userModel = require("../../models/userModel");
const addressModel = require("../../models/adressModel");
const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");
const couponModel = require("../../models/couponModel");
const razorpay = require("razorpay");
const crypto = require("crypto");
const env = require("dotenv");
env.config();

const razorpayInstance = new razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const address = await addressModel.findOne({ user: userId });

    const user = await userModel.findOne({ _id: userId });

    const product = await cartModel
      .findOne({ user: userId })
      .populate({ path: "product.productId", model: "products" })
      .populate("coupon");

    for (let i = 0; i < product.product.length; i++) {
      if (product.product[i].productId.isListed == false) {
        let product_id = product.product[i].productId;
        await cartModel.findOneAndUpdate(
          { user: userId },
          { $pull: { product: { productId: product_id } } },
          { new: true }
        );
      }
    }

    let subTotal = 0;

    for (let i = 0; i < product.product.length; i++) {
      if (product.product[i].productId.isListed) {
        if (product.product[i].productId.offerId) {
          subTotal +=
            product.product[i].productId.offerPercentage *
            product.product[i].quantity;
        } else {
          subTotal +=
            product.product[i].productId.price * product.product[i].quantity;
        }
      }
    }

    let discountamount = 0;
    let total = subTotal;

    if (subTotal < 1000 && product.coupon) {
      discountamount = product.coupon.discount;
      total = subTotal - discountamount + 50;
    } else if (subTotal < 1000) {
      total = subTotal + 50;
    } else if (product.coupon) {
      discountamount = product.coupon.discount;
      total = subTotal - discountamount;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];

    const coupon = await couponModel.find({
      criteria: { $lt: subTotal },
      expiry_date: { $gt: formattedDate },
    });

    res.render("user/checkout", {
      address,
      subTotal,
      user,
      coupon,
      discountamount,
      total,
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

const addCheckoutAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const address = {
      fullName: req.body.data.fullName,
      address: req.body.data.address,
      email: req.body.data.email,
      mobile: req.body.data.mobile,
      country: req.body.data.country,
      state: req.body.data.state,
      district: req.body.data.district,
      pincode: req.body.data.pincode,
    };

    await addressModel.findOneAndUpdate(
      { user: userId },
      { $push: { address: address } },
      { upsert: true, new: true }
    );

    res.json({ add: true });
  } catch (error) {
    res.status(500).json({ add: false });
  }
};

const order = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { selectedAddress, selectedPayment } = req.body;

    const products = await cartModel
      .findOne({ user: userId })
      .populate("product.productId");

    if (!products || !products.product) {
      // Handle case where products are not found
      return res
        .status(404)
        .json({ success: false, message: "Products not found" });
    }

    let totalPrice = 0;

    for (let i = 0; i < products.product.length; i++) {
      if (products.product[i].productId.offerId) {
        totalPrice +=
          products.product[i].productId.offerPercentage *
          products.product[i].quantity;
      } else {
        totalPrice +=
          products.product[i].productId.price * products.product[i].quantity;
      }
    }

    const coupon = await cartModel.findOne({ user: userId }).populate("coupon");

    let discount = 0;
    let total = 0;
    let shippingAmount = 0

    if (totalPrice < 1000 && coupon && coupon.coupon) {
      discount = coupon.coupon.discount;
      total = totalPrice - discount + 50;
    } else if (totalPrice < 1000) {
      shippingAmount = 50
      total = totalPrice + shippingAmount;
    } else if (coupon && coupon.coupon) {
      discount = coupon.coupon.discount;
      total = totalPrice - discount;
    }

    const address = await addressModel.findOne(
      { user: userId, "address._id": selectedAddress },
      { "address.$": 1 }
    );

    const orderStatus = selectedPayment === "Razorpay" ? "pending" : "placed";
    const paymentStatus =
      selectedPayment === "wallet"
        ? "complete"
        : selectedPayment === "Razorpay"
        ? "failed"
        : "pending";

    const newOrder = new orderModel({
      user: userId,
      deliveryAddress: address.address[0],
      payment: selectedPayment,
      product: products.product,
      shippingCharge: shippingAmount,
      discountAmount: discount,
      totalPrice: total ? total : totalPrice,
      orderStatus: orderStatus,
      paymentStatus: paymentStatus,
      orderDate: new Date(),
    });

    const createOrder = await newOrder.save();
    const orderId = createOrder._id;

    for (let i = 0; i < products.product.length; i++) {
      let productId = products.product[i].productId;
      let prdctQuantity = products.product[i].quantity;

      await orderModel.findOneAndUpdate(
        {
          _id: orderId,
          "product.productId": productId,
        },
        {
          $set: {
            "product.$[p].orderStatus": orderStatus,
            "product.$[p].paymentStatus": paymentStatus,
          },
        },
        {
          arrayFilters: [{ "p.productId": productId }],
          new: true,
        }
      );

      await productModel.findOneAndUpdate(
        { _id: productId },
        { $inc: { quantity: -prdctQuantity } }
      );
    }

    if (orderStatus === "placed") {
      await cartModel.findOneAndDelete({ user: userId });
      res.json({ success: true });
    } else if (selectedPayment === "wallet") {
      await userModel.findOneAndUpdate(
        { _id: userId },
        {
          $inc: { wallet: total ? -total : -totalPrice },
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: total ? -total : -totalPrice,
            },
          },
        }
      );
      res.json({ success: true });
    } else {
      let options = {
        amount: total ? total * 100 : totalPrice * 100,
        currency: "INR",
        receipt: "" + orderId,
      };

      razorpayInstance.orders.create(options, function (err, order) {
        if (err) {
          console.log(err);
          res
            .status(500)
            .json({
              success: false,
              message: "An error occurred while creating the order.",
            });
        } else {
          res.json({ success: false, order });
        }
      });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "An error occurred while processing the order.",
      });
  }
};

const razorpayVerify = async (req, res) => {
  try {
    const data = req.body;
    const id = req.session.user_id;
    const cartData = await cartModel.findOne({ user: id });

    const hmac = crypto.createHmac("sha256", process.env.key_secret);
    hmac.update(data.razorpay_order_id + "|" + data.razorpay_payment_id);
    const hmacValue = hmac.digest("hex");

    if (hmacValue == data.razorpay_signature) {
      for (const data of cartData.product) {
        const { productId, quantity } = data;
        await productModel.updateOne(
          { _id: productId },
          { $inc: { quantity: -quantity } }
        );
      }
    }

    await orderModel.findByIdAndUpdate(
      { _id: data.order.receipt },
      {
        $set: {
          orderStatus: "placed",
          paymentStatus: "complete",
          "product.$[].orderStatus": "placed",
          "product.$[].paymentStatus": "complete",
        },
      }
    );

    res.json({ success: true });

    await cartModel.findOneAndDelete({ user: id });
  } catch (error) {
    console.log(error.message);
  }
};

const paymentFailed = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const { orderId } = req.body;

    console.log("hurekkaaaaaaaaaaaaaaa");

    const cart = await cartModel.findOne({ user: userId });

    // ✅ Restock products
    for (const item of cart.product) {
      await productModel.updateOne(
        { _id: item.productId },
        { $inc: { quantity: item.quantity } }
      );
    }

    await orderModel.findByIdAndUpdate(orderId, {
      $set: {
        orderStatus: "pending",
        paymentStatus: "failed",
        "product.$[].orderStatus": "pending",
      },
    });

    res.json({
      success: true,
      message: "Payment failed and products restocked",
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ success: false, message: "Error processing failed payment" });
  }
};

const applyCoupon = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const couponId = req.body.id;

    await cartModel.findOneAndUpdate(
      { user: userId },
      { $set: { coupon: couponId } }
    );
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.session.user_id;
    await cartModel.findOneAndUpdate(
      { user: userId },
      { $set: { coupon: null } }
    );
    res.json({ remove: true });
  } catch (error) {
    console.log(error.message);
  }
};

const continueOrder = async (req, res) => {
  try {
    const orderId = req.body.id;

    const order = await orderModel.findOne({ _id: orderId });

    let options = {
      amount: order.totalPrice * 100,
      currency: "INR",
      receipt: "" + orderId,
    };

    razorpayInstance.orders.create(options, function (err, order) {
      if (err) {
        console.log(err);
      }
      res.json({ continue: true, order });
    });
  } catch (error) {}
};

const razorpayContinue = async (req, res) => {
  try {
    const data = req.body;
    const orderId = req.body.id;
    const orderData = await orderModel.findOne({ _id: orderId });

    const hmac = crypto.createHmac("sha256", process.env.key_secret);
    hmac.update(data.razorpay_order_id + "|" + data.razorpay_payment_id);
    const hmacValue = hmac.digest("hex");

    if (hmacValue == data.razorpay_signature) {
      for (const data of orderData.product) {
        const { productId, quantity } = data;
        await productModel.updateOne(
          { _id: productId },
          { $inc: { quantity: -quantity } }
        );
      }
    }
    const newOrder = await orderModel.findByIdAndUpdate(
      { _id: data.order.receipt },
      {
        $set: {
          orderStatus: "placed",
          paymentStatus: "complete",
          "product.$[].orderStatus": "placed",
        },
      }
    );

    res.json({ success: true });

    await cartModel.findOneAndDelete({ user: id });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCheckout,
  addCheckoutAddress,
  order,
  razorpayVerify,
  paymentFailed,
  applyCoupon,
  removeCoupon,
  continueOrder,
  razorpayContinue,
};
