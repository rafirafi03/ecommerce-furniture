const user = require('../../models/userModel');

const loadProfile = async (req,res) => {
    try {
       res.render('user/profile'); 
    } catch (error) {
        console.log(error.message);
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
    logout
}