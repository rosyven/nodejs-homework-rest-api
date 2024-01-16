const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const gravatar = require("gravatar");
const jimp = require("jimp");
const path = require("path");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) res.status(409).json({ message: "Email in use" });

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, "http");
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: "starter",
        avatarURL: newUser.avatarURL,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) res.status(401).json({ message: "Email or password is wrong" });

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare)
      res.status(401).json({ message: "Email or password is wrong" });
    const payload = {
      id: user._id,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
    await User.findByIdAndUpdate(user._id, { token });
    res.json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json();
};

const getCurrentUser = async (req, res) => {
  const { email, subscription } = req.user;

  res.json({ email, subscription });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { file } = req;

  try {
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const uploadedImage = await jimp.read(file.path);
    uploadedImage.resize(250, 250).write(`${avatarsDir}/${_id}.jpg`);

    const avatarURL = `/avatars/${_id}.jpg`;

    await User.findByIdAndUpdate(_id, { avatarURL });

    res.status(200).json({ avatarURL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { register, login, logout, getCurrentUser, updateAvatar };
