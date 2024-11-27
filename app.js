require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const indexRouter = require("./routes/indexRouter");
const registerRouter = require("./routes/registerRouter");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);
app.use("/register", registerRouter);

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
