const orderModel = require('../../models/orderModel');


const getOrder = async(req,res) => {
    try {

        const orders = await orderModel.find();
        orders.sort(function(a, b) {
            return new Date(b.orderDate) - new Date(a.orderDate);
        });
        res.render('admin/order',{orders})
        
    } catch (error) {
        console.log(error.message);
    }
}

const getOrderDetails = async (req,res)=> {
    try {

        const orderId = req.query.id;

        const orders = await orderModel.findOne({_id:orderId}).populate('product.productId');

        res.render('admin/orderDetail',{orders})
    } catch (error) {
        console.log(error.message)
    }
}

const patchOrderStatus = async (req,res) => {
    try {
        const status = req.body.val
        console.log(status,":statusssssssss");
        const orderId = req.body.id
        console.log(orderId,":idddddd");

        await orderModel.findOneAndUpdate({_id:orderId},
            {$set:{orderStatus:status}})
        res.json({status:true})
    } catch (error) {
        console.log(error.message);
        res.json({status:false})
    }
}

module.exports = {
    getOrder,
    getOrderDetails,
    patchOrderStatus
}