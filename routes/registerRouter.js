const { Router } = require("express");
const registerRouter = Router();
const {
  showRegister,
  registerValidationRules,
  registerUser,
} = require("../controllers/registerController");

registerRouter.get("/", showRegister);
registerRouter.post("/", registerValidationRules, registerUser);

module.exports = registerRouter;
