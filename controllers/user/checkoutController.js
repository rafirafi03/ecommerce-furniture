const cartModel = require('../../models/cartModel');
const addressModel = require('../../models/adressModel');
const orderModel = require('../../models/orderModel');

const loadCheckout = async (req, res) => {
    try {

        const userId = req.session.user_id;

        const address = await addressModel.findOne({user:userId})

        const product = await cartModel.findOne({user:userId}).populate('product.productId');

        const subTotal = product.product.reduce((acc,curr)=>acc+curr.totalPrice ,0)

        res.render('user/checkout',{address,subTotal})
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

        const {selectedAddress,selectedPayment } = req.body;

        const products = await cartModel.findOne({user:userId})

        console.log(products.product,':prdctsssssssssss');

        const totalPrice = products.product.reduce((acc,curr)=>acc+curr.totalPrice ,0);

        const address = await addressModel.findOne({user:userId,'address._id':selectedAddress},{ 'address.$': 1 })

        const order = new orderModel({
            user: userId,
            deliveryAddress: address.address[0],
            payment: selectedPayment,
            product: products.product,
            totalPrice: totalPrice,
            orderStatus: 'placed',
            orderDate: new Date(),
          });

          order.save();

          res.json({save:true})


    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCheckout,
    addCheckoutAddress,
    order
}