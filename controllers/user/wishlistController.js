const productModel = require('../../models/productModel');
const wishlistModel = require('../../models/wishlistModel');

const loadWishlist = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const product = await wishlistModel.findOne({user: userId}).populate('product.productId');
        res.render('user/wishlist',{product})
    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async (req,res) => {
    try {
        if (req.session.user_id) {
            const productId = req.body.id;
            const userId = req.session.user_id;
            const productData = await productModel.findById(productId);
            const wishlistProduct = await wishlistModel.findOne({user: userId, 'product.productId': productId});
            const productPrice = productData.price;

                if (wishlistProduct) {
                    res.json({status:true, wishlistProduct})
                } else {
                    const data = {
                        productId : productId,
                        price : productPrice,
                    }

                    await wishlistModel.findOneAndUpdate({ user: userId}, {$set :{ user: userId}, $push: {product: data}}, {upsert: true, new: true});
                    res.json({success: true});
                }
        } else {
            res.status(401).json({failed: true})
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).render('500')
    }
}

const removeFromWishlist = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const productId = req.params.productId;

        await wishlistModel.findOneAndUpdate(
            { user: userId},
            {$pull : {product: {productId : productId}}},
            {new : true}
        )

        res.sendStatus(200);
    } catch (error) {
        console.error('error removing product from wishlist',error);
        res.sendStatus(500);
    }
}

module.exports = {

    loadWishlist,
    addToWishlist,
    removeFromWishlist

}