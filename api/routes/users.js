const router = require("express").Router();
const User = require("../database/models/user.model");
const Post = require("../database/models/post.model");
const bcrypt = require("bcrypt");

//UPDATE
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const { email, password, username, userId, profilePic } = req.body;
      let _encPassword = "";
      if (password && password !== "") {
        const salt = await bcrypt.genSalt(10);
        _encPassword = await bcrypt.hash(password, salt);
      }
      let info = {};
      if (email && email !== "") info["email"] = email;
      if (password && password !== "") info["password"] = _encPassword;
      if (username && username !== "") info["username"] = username;
      if (profilePic && profilePic !== "") info["profilePic"] = profilePic;
      const updatedUser = await User.findByIdAndUpdate(userId, info, { new: true });
      res.status(200).json("updatedUser");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(401).json("You can update only your account!");
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      try {
        await Post.deleteMany({ username: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("User has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } catch (err) {
      res.status(404).json("User not found!");
    }
  } else {
    res.status(401).json("You can delete only your account!");
  }
});

//GET USER
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
