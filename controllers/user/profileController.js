const user = require('../../models/userModel');
const userAddress = require('../../models/adressModel');


const loadProfile = async (req,res) => {


    const userId = req.session.user_id;

    const users = await user.findOne({_id:userId});
    const address = await userAddress.findOne({user:userId});
    try {
       res.render('user/profile',{users,address}); 
    } catch (error) {
        console.log(error.message);
    }
    
}

const editProfile = async (req,res) => {
    try {
        const userData = req.session.user_id;
        const data = await user.findOneAndUpdate(
        {_id:userData},
        {
            $set: {
                name: req.body.name,
                mobile: req.body.mobile
            },
        },
        {new:true}
    );
    res.json({ok:true})
    } catch (error) {
        console.log(error.message);
        res.status(500).render('500');
    } 
};

const addAddress = async (req,res) => {
    try {
        const userId = req.session.user_id;
        const address = {
            fullName : req.body.fullName,
            address: req.body.address,
            email : req.body.email,
            mobile : req.body.mobile,
            country : req.body.country,
            state : req.body.state,
            district : req.body.district,
            pincode : req.body.pincode
        };
        console.log(address);

        const findAddress = await userAddress.findOneAndUpdate(
            {user: userId},
            {$push: {address:address}},
            {upsert:true,new:true}
        )

        console.log(findAddress);

        res.json({add:true});

    } catch (error) {
        console.error(error);
        res.status(500).render(500);
    }
}

const editAddress = async (req,res)=> {
    try {
        const id = await userAddress.findOne({_id:address.adress._id});
        
    } catch (error) {
        
    }
}


    // Other controller methods...

    const removeAddress = async (req, res) => {
        try {
            const userId = req.session.user_id;
            const addressId = req.params.addressId;

            // Remove the address from the user's address array
            await userAddress.findOneAndUpdate(
                { user: userId },
                { $pull: { address: { _id: addressId } } },
                { new: true }
            );

            res.sendStatus(200);
        } catch (error) {
            console.error('Error deleting address:', error);
            res.sendStatus(500);
        }
    }



const logout = async (req,res) => {
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
       console.log(error.message); 
    }
}

module.exports = {
    loadProfile,
    logout,
    editProfile,
    addAddress,
    editAddress,
    removeAddress
}