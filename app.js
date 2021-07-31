require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const List = require("./models/list");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
const newlist = new List();

const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.set("trust proxy", 1);

app.use(
  session({
    secret: "secretidhere",
    resave: false,
    saveUninitialized: false,
  })
); //一定要先use session才能寫下面的

app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error("Oh no")); //handle error
  }
  next(); //otherwise continue
});

app.use(passport.initialize()); //順序很重要
app.use(passport.session()); //順序很重要
app.use(flash());

//認證使用者
passport.use(new LocalStrategy(User.authenticate())); //User是從user.js import過來的可以用authenticate是因為有passportLocalMongoose插件
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); //判斷是否要把使用者放到session裡

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.err_msg = req.flash("err_msg");
  res.locals.error = req.flash("error");
  next();
});

//檢查是否為登入狀態
// function isLoggedIn(req, res, next) {
//   if (!req.isAuthenticated()) {
//     req.session.returnTo = req.originalUrl;
//     // req.flash("err_msg", "Pease login first.");
//     // res.redirect("/login");
//   } else {
//     next();
//   }
// }

// connect to mongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gymDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log("Successfully connnecting to mongoDB.");
  })
  .catch((e) => {
    console.log(e);
  });

app.get("/", async (req, res, next) => {
  if (req.isAuthenticated()) {
    let { _id } = req.user;
    let user = await User.findOne({ _id });
    res.render("index", { user: req.user });
  } else {
    res.render("index");
  }
});

app.get("/course", async (req, res) => {
  if (req.isAuthenticated()) {
    let { _id } = req.user;
    let user = await User.findOne({ _id });
    res.render("course", { user: req.user });
  } else {
    res.render("course");
  }
});

app.get("/about", async (req, res) => {
  if (req.isAuthenticated()) {
    let { _id } = req.user;
    let user = await User.findOne({ _id });
    res.render("about", { user: req.user });
  } else {
    res.render("about");
  }
});

app.get("/news", async (req, res) => {
  if (req.isAuthenticated()) {
    let { _id } = req.user;
    let user = await User.findOne({ _id });
    res.render("news", { user: req.user });
  } else {
    res.render("news");
  }
});

app.get("/charge", async (req, res) => {
  if (req.isAuthenticated()) {
    let { _id } = req.user;
    let user = await User.findOne({ _id });
    res.render("charge", { user: req.user });
  } else {
    res.render("charge");
  }
});

app.get("/reserve", async (req, res) => {
  let currentList = await List.findOne({ _id: "606be2a1c33f5f2e80b8ff89" });
  // let currentList = await List.findOne({ _id: "606ad8297bb84a00045d2df4" });
  if (req.isAuthenticated()) {
    let { _id } = req.user;

    let user = await User.findOne({ _id });
    res.render("reserve", { user: req.user, newlist: currentList });
    // console.log(newlist.person);
  } else {
    res.render("reserve", { newlist: currentList });
  }
});

app.get("/reserve/success/", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      let { username } = req.user;
      let user = await User.findOne({ username });
      let currentList = await List.findOne({ _id: "606be2a1c33f5f2e80b8ff89" });
      // let currentList = await List.findOne({ _id: "606ad8297bb84a00045d2df4" });
      // console.log(currentList);
      currentList.person.push(user.fullname);
      await currentList.save();

      // newlist.person.push(user.fullname);
      // await newlist.save();
      console.log({ username });
      console.log(user.fullname);

      res.render("success", { user: req.user, newlist: currentList });
    } else {
      res.render("success", { newlist: currentList });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/reserve/delete/", async (req, res) => {
  try {
    if (req.isAuthenticated()) {
      let { username } = req.user;
      let user = await User.findOne({ username });
      let currentList = await List.findOne({ _id: "606be2a1c33f5f2e80b8ff89" });
      // let currentList = await List.findOne({ _id: "606ad8297bb84a00045d2df4" });
      // console.log(currentList);
      currentList.person.pull(user.fullname);
      await currentList.save();

      // newlist.person.push(user.fullname);
      // await newlist.save();
      console.log({ username });
      console.log(user.fullname);

      res.render("delete", { user: req.user, newlist: currentList });
    } else {
      res.render("delete", { newlist: currentList });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: "帳號或密碼錯誤", //如果登入失敗會顯示flash message
    failureRedirect: "/login", //如果登入失敗會重新導向
  }),
  (req, res) => {
    // if (req.originalUrl) {
    //   let newRoute = req.originalUrl;
    //   req.originalUrl = "";
    //   res.redirect(newRoute);
    // } else {
    res.redirect("/");
    // }
  }
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res, next) => {
  let { fullname, gender, birth, phone, username, password, password2 } =
    req.body;
  //檢查兩次輸入的密碼是否相同
  if (password !== password2) {
    req.flash("err_msg", "兩次輸入密碼不同，請再試一次");
    res.redirect("/register");
  } else {
    //還沒註冊
    try {
      let foundUser = await User.findOne({ username });
      if (foundUser) {
        req.flash("err_msg", "此帳號已被註冊");
        res.redirect("/register");
      } else {
        let newUser = new User(req.body);
        await User.register(newUser, password); //可以用 User.register是因為有passport-local-mongoose
        req.flash("success_msg", "帳號已成功註冊,可以進行登入");
      }
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
