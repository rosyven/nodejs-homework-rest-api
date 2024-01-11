const Contact = require("../models/contact");

const listContacts = async (ownerId) => {
  return Contact.find({ owner: ownerId });
};

const getContactById = async (contactId, ownerId) => {
  return Contact.findOne({ _id: contactId, owner: ownerId });
};

async function removeContact(contactId, ownerId) {
  return Contact.findByIdAndDelete({ _id: contactId, owner: ownerId });
}

async function addContact(body, ownerId) {
  return Contact.create({ ...body, owner: ownerId });
}

const updateContact = async (contactId, body, ownerId) => {
  return Contact.findByIdAndUpdate({ _id: contactId, owner: ownerId }, body, {
    new: true,
  });
};

const updateFavoriteStatus = async (contactId, favorite, ownerId) => {
  return Contact.findByIdAndUpdate(
    { _id: contactId, owner: ownerId },
    { favorite },
    { new: true }
  );
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavoriteStatus,
};
