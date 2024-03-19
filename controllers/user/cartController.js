const products = require('../../models/productModel');
const cartModel = require('../../models/cartModel');

const loadCart = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const product = await cartModel.findOne({user:userId}).populate('product.productId');

        console.log(product,":prdctttttt")

        let subTotal;
        if (product) {
            subTotal = product.product.reduce((acc,curr)=> acc+curr.totalPrice ,0);
        }
        res.render('user/cart',{product,subTotal});
        
    } catch (error) {
        console.log(error.message);
    }
}

const addToCart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const productId = req.body.id;
            const userId = req.session.user_id;
            const productData = await products.findById(productId);
            const cartProduct = await cartModel.findOne({ user: userId, 'product.productId': productId });
            const productPrice = productData.price;

            if (productData.quantity > 0) {
                if (cartProduct) {
                    res.json({ status:true, cartProduct });
                }else if(productData.offerId) {
                    const data = {
                        productId: productId,
                        price: productPrice,
                        totalPrice: productData.offerPercentage
                    };

                    await cartModel.findOneAndUpdate({ user: userId }, { $set: { user: userId }, $push: { product: data } }, { upsert: true, new: true });
                    res.json({ success: true });
                }else {
                    const data = {
                        productId: productId,
                        price: productPrice,
                        totalPrice: productPrice
                    };

                    await cartModel.findOneAndUpdate({ user: userId }, { $set: { user: userId }, $push: { product: data } }, { upsert: true, new: true });
                    res.json({ success: true });
                }

            } else {
               return res.status(400).json({ stock: true }); 
            }
        } else {
            res.status(401).json({ failed: true }); 
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).render('500');
    }
}

const removeFromCart = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.params.productId;

        await cartModel.findOneAndUpdate(
            { user: userId},
            {$pull : {product : {productId : productId}}},
            {new: true}
        );

        res.sendStatus(200);
    } catch (error) {
        console.error('Error removing product from cart:',error);
        res.sendStatus(500);
    }
}

const quantity = async (req,res) => {
    try {

        let {id , quantity, productId} = req.body;

        const userId = req.session.user_id

        const product = await products.findOne({_id:productId})

        const cartProduct = await cartModel.findOne({user: userId,'product.productId':productId}).populate('product.productId');

        // const currQuantity =  userCart.product.find((item)=>{
        //     return item._id.toString() === id.toString();
        // })

        let totalPrice;

        if(product.offerId){
            totalPrice = (quantity * product.offerPercentage).toFixed(2);
        }else{
            totalPrice = quantity * product.price
        }

        


        if (product.quantity < quantity) {
            res.json({stockOut:true})
        } else {
            await cartModel.findOneAndUpdate(
                { user: userId, 'product._id': id },
                {
                  $set: {
                    'product.$.quantity': quantity,
                    'product.$.totalPrice': totalPrice
                  },
                },
                { new: true }
              );
    
              
    
            res.json({status:true})
        }
        
        
    } catch (error) {
        console.log(error);
    }
}

// const addShipping = async(req,res) => {

//     try {
//         const id = req.session.user_id

//         console.log(id);

//         console.log("ethiiiiiii");

//     const option = req.body.option;
//     const amount = req.body.amount;

//     await cartModel.findOneAndUpdate(
//         {user : id},
//         {$set:{
//             shippingMethod : option,
//             shippingAmount : amount
//         }},{new:true}
//     )

//     res.json({success:true})
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).render('500');
//     }

    
// }

module.exports = {

    addToCart,
    loadCart,
    removeFromCart,
    quantity,
    
}