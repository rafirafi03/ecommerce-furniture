const user = require('../models/userModel');

const isLogin = async (req, res, next) => {
    try {
        if(req.session.user_id) {
            next()
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
}


const isLogout = async (req, res, next) => {
    try {
        if(req.session.user_id) {
            res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isBlocked = async (req,res,next) => {
    try {
        const userId = req.session.user_id;
        const isBlocked = await user.findOne(
            {
                _id:userId,
                isBlocked:true 
            }
        );


        if (isBlocked) {
            req.session.destroy();
            res.redirect('/');
            
        } else{
            next();
        }
    } catch (error) {
        
    }
}

module.exports = {
    isLogin,
    isLogout,
    isBlocked
}