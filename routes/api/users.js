const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateAvatar,
  verifyEmail,
  resendVerificationEmail,
} = require("../../controllers/users");
const authMiddleware = require("../../middlewares/authMiddleware");
const upload = require("../../middlewares/uploadMiddleware");

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

router.post("/register", async (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  await register(req, res);
});

router.post("/login", async (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  await login(req, res);
});

router.post("/logout", authMiddleware, async (req, res, next) => {
  await logout(req, res);
});

router.get("/current", authMiddleware, async (req, res, next) => {
  await getCurrentUser(req, res);
});

router.patch("/avatars", authMiddleware, upload.single("avatar"), updateAvatar);

router.get("/verify/:verificationToken", async (req, res, next) => {
  await verifyEmail(req, res);
});

router.post("/verify", async (req, res, next) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.message });
  }
  await resendVerificationEmail(req, res);
});

module.exports = router;
