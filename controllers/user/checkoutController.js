const cartModel = require('../../models/cartModel');
const userModel = require('../../models/userModel')
const addressModel = require('../../models/adressModel');
const orderModel = require('../../models/orderModel');
const productModel = require('../../models/productModel');
const couponModel = require('../../models/couponModel')
const razorpay = require('razorpay');
const crypto = require('crypto');
const env = require('dotenv');
env.config();


const razorpayInstance = new razorpay({
    key_id : process.env.key_id,
    key_secret : process.env.key_secret
})

const loadCheckout = async (req, res) => {
    try {

        const userId = req.session.user_id;

        const address = await addressModel.findOne({user:userId})

        const user = await userModel.findOne({_id:userId});

        const product = await cartModel.findOne({user:userId}).populate({ path: 'product.productId', model: 'products' }).populate('coupon');

        console.log("cpnprdctttt",product,":cpnprdctcpnnnnnnnnnnnnn");

        
        const subTotal = product.product.reduce((acc,curr)=>acc+curr.totalPrice ,0)

        let discountamount = 0;
        let total = subTotal;

        if(product.coupon){
            discountamount = product.coupon.discount;
            total = subTotal-discountamount;
        }

        const coupon = await couponModel.find({criteria : {$lt:subTotal}})

        console.log(coupon,":cpmnnnnnnnnn")

        res.render('user/checkout',{address,subTotal,user,coupon,discountamount,total,product})
    } catch (error) {
        console.log(error);
    }
}

const addCheckoutAddress = async (req,res) => {
    try {
        
        const userId = req.session.user_id;

        const address = {
            fullName : req.body.data.fullName,
            address: req.body.data.address,
            email : req.body.data.email,
            mobile : req.body.data.mobile,
            country : req.body.data.country,
            state : req.body.data.state,
            district : req.body.data.district,
            pincode : req.body.data.pincode
        };

        console.log(address," ","addresssssss")

        await addressModel.findOneAndUpdate(
            {user:userId},
            {$push:{address:address}},
            {upsert:true,new:true}
        )

        res.json({add:true})

    } catch (error) {
        res.status(500).json({add:false});
    }
}

const order = async (req,res) => {
    try {

        const userId = req.session.user_id;

        const {selectedAddress,selectedPayment} = req.body;
                
        console.log(selectedPayment,":slctpymntttttt")

        const products = await cartModel.findOne({user:userId})

        const totalPrice = products.product.reduce((acc,curr)=>acc+curr.totalPrice ,0);

        const coupon = await cartModel.findOne({user:userId}).populate('coupon');

        let discount = 0;

        let total = 0;

        if(coupon.coupon){
            discount = coupon.coupon.discount;
            total = totalPrice-discount;
        }

        const address = await addressModel.findOne({user:userId,'address._id':selectedAddress},{ 'address.$': 1 })

        const orderStatus = selectedPayment==='Razorpay' ? 'pending' : 'placed';

        console.log(orderStatus,":ststussss");

        const order = new orderModel({
            user: userId,
            deliveryAddress: address.address[0],
            payment: selectedPayment,
            product: products.product,
            discountAmount: discount,
            totalPrice: total ? total : totalPrice,
            orderStatus: orderStatus,
            orderDate: new Date(),
          });

          const createOrder = await order.save();

        const orderId = createOrder._id
          console.log(orderId);

          

          for( let i=0 ; i < products.product.length ; i ++ ) {
            let productId = products.product[i].productId;
            let prdctQuantity = products.product[i].quantity;

            await productModel.findOneAndUpdate({_id:productId},
                {$inc:{quantity:-prdctQuantity}})

          }
          console.log(orderStatus,'fffffffffffffffffffffffff');

          if (orderStatus === 'placed') {
            console.log("ifffffffff");
            await cartModel.findOneAndDelete({user:userId});
            res.json({save:true})
          } else if(selectedPayment === 'wallet'){
            await userModel.findOneAndUpdate(
                {_id:userId},
                {$inc:{wallet:total ? -total : -totalPrice},
                $push:{
                    walletHistory:{
                        date:Date.now(),
                        amount:total ? -total : -totalPrice
                    }
                }
                }
            )

            res.json({save:true})
          } else {
            let options = {
                amount: total ? total * 100 : totalPrice * 100,
                currency: "INR",
                receipt: "" + orderId,
              };
              razorpayInstance.orders.create(options, function (err, order) {
                if (err) {
                  console.log(err);
                }
                res.json({ success: false, order });
              });


          }



    } catch (error) {
        console.log(error.message);
    }
}

const razorpayVerify = async (req,res) => {

    try {
        const data = req.body;
        const id = req.session.user_id;
        const cartData = await cartModel.findOne({user:id})
        console.log(data,":dataaaa");
        console.log(id,":idddddd");
        console.log(cartData,":crtdataaaa")
    
        const hmac = crypto.createHmac("sha256", process.env.key_secret);
        hmac.update(data.razorpay_order_id + "|" + data.razorpay_payment_id);
        const hmacValue = hmac.digest("hex");
    
        if (hmacValue == data.razorpay_signature) {
          for (const data of cartData.product) {
            const { productId, quantity } = data;
            await productModel.updateOne({ _id: productId }, { $inc: { quantity: -quantity } });
          }
        }
        const newOrder = await orderModel.findByIdAndUpdate(
            {_id:data.order.receipt},
            {$set:{orderStatus:'placed'}}
        ); 

        res.json({success:true})

        await cartModel.findOneAndDelete({user:id});

    } catch (error) {
        console.log(error.message)
    }

    
}

const applyCoupon = async (req,res) => {
    try {

        const userId = req.session.user_id
        const couponId = req.body.id;

        await cartModel.findOneAndUpdate({user:userId},{$set:{coupon:couponId}});
        res.json({success:true})
        console.log(couponId,":cpnidddddddddddd")
    } catch (error) {
        console.log(error.message)
    }
}

const removeCoupon = async (req,res) => {
    try {
        const userId = req.session.user_id
        await cartModel.findOneAndUpdate({user:userId},{$set:{coupon:null}})
        res.json({remove:true})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCheckout,
    addCheckoutAddress,
    order,
    razorpayVerify,
    applyCoupon,
    removeCoupon
}