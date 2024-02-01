const user = require("../../models/userModel");

// Code for load the user page.
const loadUsers = async (req, res) => {
    try {
      const users = await user.find({
        verified: true,
      });
      res.render("admin/users", { page: "users", users });
    } catch (error) {
      console.log(error.message);
    }
  };

  // Code for block or unblock the user.
const blockUser = async (req, res) => {
    try {
      const { id } = req.params;
      const user1 = await user.findOne({ _id: id });
      if (user1.isBlocked) user1.isBlocked = false;
      else user1.isBlocked = true;
      await user1.save();
      res.status(200).json({ message: "true" });
    } catch (err) {
      console.log(err);
    }
  };

module.exports = {
    loadUsers,
    blockUser
}