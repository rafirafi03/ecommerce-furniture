const couponModel = require('../../models/couponModel');

const getCoupons = async (req,res)=>{
    try {

        const coupons = await couponModel.find({});
        res.render('admin/coupon',{coupons})
    } catch (error) {
        console.log(error.message);
    }
}

const getAddCoupon = async (req,res)=>{
    try {
        res.render('admin/addCoupon')
    } catch (error) {
        console.log(error.message)
    }
}

const postAddCoupon = async (req,res) => {
    try {
        // let data = {
        //     name : req.body.name,
        //     code : req.body.code,
        //     discount : req.body.discountAmount,
        //     criteria : req.body.criteriaAmount,
        //     activation_date : req.body.activationDate,
        //     expiry_date : req.body.expiryDate
        // }
        // console.log(data,":dataaaaaa")

        const couponExists = await couponModel.findOne({name:req.body.name})

        if (couponExists) {
           res.render('admin/addCoupon',{
            message:'This coupon already exists!!'
           }) 
        } else {

            let couponCode;

            const generateCouponCode = () => {

              const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
              couponCode = '';
          
              for (let i = 0; i < 6; i++) {
                couponCode += characters.charAt(Math.floor(Math.random() * characters.length));
              }
          
              return couponCode;
          };
        
          generateCouponCode();

            const coupon = new couponModel({
                name: req.body.name,
                code: couponCode,
                discount: req.body.discountAmount,
                criteria: req.body.criteriaAmount,
                activation_date: req.body.activationDate,
                expiry_date: req.body.expiryDate
            });

            await coupon.save()
            res.redirect('/admin/coupon');
        }

    } catch (error) {
        console.log(error.message)
    }
}

const deleteCoupon = async (req,res)=>{
    const id = req.body.id;
    console.log(id,":iddddd")
    
    await couponModel.findOneAndDelete({_id:id})

    res.json({response:true})
}

module.exports = {
    getCoupons,
    getAddCoupon,
    postAddCoupon,
    deleteCoupon
}