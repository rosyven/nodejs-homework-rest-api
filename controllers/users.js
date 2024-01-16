const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const gravatar = require("gravatar");
const jimp = require("jimp");
const path = require("path");
const { nanoid } = require("nanoid");
const sendEmail = require("../helpers/sendMail");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) res.status(409).json({ message: "Email in use" });

    const hashPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email, { s: "250", d: "retro" }, "http");
    const verificationToken = nanoid();
    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const mail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">Click verify email</a>`,
    };
    await sendEmail(mail);

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

const verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!email) {
      return res.status(400).json({ message: "Missing required field: email" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }

    const verificationToken = nanoid();
    await User.findByIdAndUpdate(user._id, { verificationToken });

    const mail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="http://localhost:3000/users/verify/${verificationToken}">Click to verify email</a>`,
    };
    await sendEmail(mail);

    return res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) res.status(401).json({ message: "Email or password is wrong" });
    if (!user.verify)
      res.status(401).json({ message: "Email is not verified" });

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

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
};
