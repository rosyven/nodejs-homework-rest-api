const express = require("express");
const router = express.Router();
const Joi = require("joi");
const {
  register,
  login,
  logout,
  getCurrentUser,
} = require("../../controllers/users");
const authMiddleware = require("../../middlewares/authMiddleware");

const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
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

module.exports = router;
