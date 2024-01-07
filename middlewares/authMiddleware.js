const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const { User } = require("../models/user");

const authMiddleware = async (req, res, next) => {
  const { authorization = "" } = req.headers;

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer") {
    return res.status(401).json({ message: "Unauthorized!" });
  }
  try {
    const { id } = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(id);
    if (!user || !user.token || user.token !== token) {
      return res.status(401).json({ message: "Unauthorized!!" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized!!!" });
  }
};

module.exports = authMiddleware;
