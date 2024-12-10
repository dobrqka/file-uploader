require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const indexRouter = require("./routes/indexRouter");
const registerRouter = require("./routes/registerRouter");
const loginRouter = require("./routes/loginRouter");
const logoutRouter = require("./routes/logoutRouter.js");
const fileRouter = require("./routes/fileRouter.js");
const folderRouter = require("./routes/folderRouter.js");
const app = express();
require("./middleware/passport.js");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use("/", indexRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/file", fileRouter);
app.use("/folder", folderRouter);

const PORT = 8020;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
