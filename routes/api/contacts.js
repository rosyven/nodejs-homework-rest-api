const express = require("express");
const Joi = require("joi");
const authMiddleware = require("../../middlewares/authMiddleware");

const schema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    "any.required": "missing fields",
  }),
  email: Joi.string().email().required().messages({
    "any.required": "missing fields",
  }),
  phone: Joi.string().min(5).required().messages({
    "any.required": "missing fields",
  }),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean()
    .required()
    .messages({ "any.required": "missing field favorite" }),
});

const router = express.Router();
router.use(authMiddleware);
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
  updateFavoriteStatus,
} = require("../../controllers/contacts");

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts(req.user._id);
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId, req.user._id);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  const { name, email, phone } = req.body;
  try {
    const newContact = await addContact({ name, email, phone }, req.user._id);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const result = await removeContact(contactId, req.user._id);
    if (result) {
      res.status(200).json({ message: "contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.put("/:contactId", async (req, res, next) => {
  const { error } = schema.validate(req.body);
  const { contactId } = req.params;
  const { name, email, phone } = req.body;

  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const updatedContact = await updateContact(
      contactId,
      {
        name,
        email,
        phone,
      },
      req.user._id
    );
    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  const { contactId } = req.params;
  const { error } = updateFavoriteSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: error.message });
    return;
  }
  try {
    const updatedContact = await updateFavoriteStatus(
      contactId,
      req.body,
      req.user._id
    );
    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
