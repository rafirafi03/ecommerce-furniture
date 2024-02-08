const products = require('../../models/productModel');
const cartModel = require('../../models/cartModel');

const loadCart = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const product = await cartModel.findOne({user:userId}).populate('product.productId');
        res.render('user/cart',{product});
    } catch (error) {
        
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
                } else {
                    const data = {
                        productId: productId,
                        price: productPrice,
                        totalPrice: productPrice
                    };

                    await cartModel.findOneAndUpdate({ user: userId }, { $set: { user: userId }, $push: { product: data } }, { upsert: true, new: true });
                    res.json({ success: true });
                }

            } else {
                res.status(400).json({ stock: true }); // Corrected HTTP status code
            }
        } else {
            res.status(401).json({ failed: true }); // Corrected HTTP status code
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

        console.log(userId," ","userID")
        console.log(productId, ' ', "prdcrtiD");

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

module.exports = {
    addToCart,
    loadCart,
    removeFromCart
}