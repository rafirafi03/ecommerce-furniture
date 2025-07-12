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
        const orderId = req.body.id

        await orderModel.findOneAndUpdate({_id:orderId},
            {$set:
                {
                    orderStatus:status,
                    'product.$[].orderStatus': status
                }
            
            })
        res.json({status:true})
    } catch (error) {
        console.log(error.message);
        res.json({status:false})
    }
}

const returnProduct = async (req,res)=>{

    try {
        
       let {id,orderId} = req.body;

       console.log(req.body)

       await orderModel.findOneAndUpdate(
        {
          _id: orderId,
          'product.productId': id
        },
        {
          $set: {
            'product.$[prod].orderStatus': 'returned',
          }
        },
        {
          arrayFilters: [{ 'prod.productId': id }],
          new: true 
        }
      );

      res.json({accepted:true})

    } catch (error) {
        
    }
}

const returnCancel = async (req,res)=> {

    try {
        
        let {id,orderId} = req.body;

        await orderModel.findOneAndUpdate(
            {
              _id: orderId,
              'product.productId': id
            },
            {
              $set: {
                'product.$[prod].orderStatus': 'return declined',
              }
            },
            {
              arrayFilters: [{ 'prod.productId': id }],
              new: true 
            }
          );
    
          res.json({declined:true})


    } catch (error) {
        
    }
}

module.exports = {
    getOrder,
    getOrderDetails,
    patchOrderStatus,
    returnProduct,
    returnCancel
}