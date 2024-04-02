const offerModel = require('../../models/offerModel');
const productModel = require('../../models/productModel');
const categoryModel = require('../../models/categoryModel');


const getOffer = async (req,res)=>{
    try {

        const offers = await offerModel.find({})
        res.render('admin/offer',{offers})
    } catch (error) {
        console.log(error.message)
    }
}

const getAddOffer = async (req,res) => {
    try {
        res.render('admin/addOffer')
    } catch (error) {
        console.log(error.message)
    }
}

const postAddOffer = async (req,res) => {
    try {
        

        const offerExists = await offerModel.findOne({name:req.body.name});

        if (offerExists) {
            res.render('admin/addOffer',{
                message : 'This offer is alreadt exists!!'
            })
        } else {
            const offer = new offerModel({
                name : req.body.name,
                discount : req.body.discount,
                activation_date : req.body.activationDate,
                expiry_date : req.body.expiryDate
            });

            await offer.save()
            res.redirect('/admin/offer');
        }

    } catch (error) {
        console.log(error.message)
    }
}

const deleteOffer = async (req,res) => {
    try {

        const id = req.body.id;

        await offerModel.findOneAndDelete({_id:id})
        res.json({response:true})

    } catch (error) {
        console.log(error.message)
    }
}

const applyOffer = async (req,res) => {
    try {
        const productId = req.body.productId;
        const offerId = req.body.id;


        const product = await productModel.findOne({_id:productId})

        const offer = await offerModel.findOne({_id:offerId})

        await productModel.findOneAndUpdate({_id:productId},{
            offerId : req.body.id,
            offerPercentage : product.price - (product.price * offer.discount / 100)
        })

        res.json({status:true})

    } catch (error) {
        console.log(error.message)
    }
}

const removeOffer = async (req,res) => {

    try {
        
        const id = req.body.id;

        await productModel.findOneAndUpdate({_id:id},{
            offerId : null,
            offerPercentage : null
        })

        res.json({remove:true})
    } catch (error) {
        console.log(error.message)
    }
}

const categoryOffer = async (req,res) => {
    try {
        const categoryId = req.body.categoryId;
        const offerId = req.body.id;


        const product = await productModel.find({category:categoryId})


        const offer = await offerModel.findOne({_id:offerId})


        for (const prod of product) {
            const updatedOfferPercentage = prod.price - (prod.price * offer.discount / 100);
            
            // Update the documents
            await productModel.updateOne({ _id: prod._id }, {
                offerId: req.body.id,
                offerPercentage: updatedOfferPercentage
            });
        }

        await categoryModel.findOneAndUpdate({_id:categoryId},{
            offerId : req.body.id
        })

        res.json({status:true})

    } catch (error) {
        console.log(error.message)
    }
}

const removeCategoryOffer = async (req,res) => {

    try {
        
        const id = req.body.id;

        await productModel.updateMany({category:id},{
            offerId : null,
            offerPercentage : null
        })

        await categoryModel.findOneAndUpdate({_id:id},{
            offerId : null
        })

        res.json({remove:true})
    } catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    getOffer,
    getAddOffer,
    postAddOffer,
    deleteOffer,
    applyOffer,
    removeOffer,
    categoryOffer,
    removeCategoryOffer
}