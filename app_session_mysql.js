
var express = require('express');
var mysql = require('mysql');
var bodyParser = require("body-parser");
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var flash = require('connect-flash');

var app = express();

// var index = require('./routes/index');
// var users = require('./routes/users');

//what type of login method will be used
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password: 'yogurt59?!A',
  database : 'practice'
});


//store express session to maintain user's info
app.use(session({
  secret : 'MYSECRETSECRET', //key value for sesssion
  resave : false,
  saveUninitialized : true
  // store : new MySQLStore({
  //   host: 'localhost',
  //   port: 3000,
  //   user: 'root',
  //   password: 'yogurt59?!A',
  //   database: 'practice'
  // })
  //cookie:{secure: true}
}));

//passpot module initialization
app.use(flash());
app.use(passport.initialize()); //passport initialize
app.use(passport.session());

// app.use('/', index);
// app.use('/users', users);

app.get('/', function(req, res){
 res.render('welcome');
});

app.get("/'welcome'", function(req, res){
 res.render('login');
});

app.get("/home", function(req, res){
 var q = "select quote from quote order by rand() limit 1";
 connection.query(q, function (error, result) {
 if (error) throw error;
 //console.log(result[0]);
 var quote = result[0].quote
 res.render('home', {quote:quote});
 });

});

app.get("/login", function(req, res){
 res.render('login');
});

app.get("/register", function(req, res){
  res.render('sign_up');
});

app.post("/register", async(req, res)=>{

  try{
    var user = {
      id: req.body.id,
      name: req.body.user_name,
      password: req.body.password,
      sex: req.body.sex,
      height: req.body.height,
      weight: req.body.weight,
      age: req.body.age
  	};
    var q = 'insert into user set ?'
    connection.query(q, user, function (error, results) {
    if (error) throw error;
    });
  }catch{
    res.redirect('/');
  }
  console.log(user);


});


passport.use(new LocalStrategy({
   usernameField: 'id',
   passwordField: 'password',
   passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done){
    if(!username || !password ) {
      return done(null, false, req.flash('message','All fields are required.'));
    }
    var q = "select * from user where id = ?"
    connection.query(q, [username], async(err, res)=>{
        console.log(err);
        console.log(res);
      if (err) return done(req.flash('message',err));
      if(!res.length){ return done(null, false, req.flash('message','Invalid id or password.')); }
      var user = res[0];
      //console.log(user_password, hashedPassword);
      if(user.password != password){
          return done(null, false, req.flash('message','Invalid id or password.'));
       }
      return done(null, user);
    });
  }
));

//autentication Routing when login is success or fail
app.post("/login", passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
})
);

// when login is successful
passport.serializeUser(function(user, done){
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    connection.query("select * from user where id = "+ id, function (err, user){
        done(err, user.id);
    });
});







//logout function in passport
app.get('/logout', function(req, res){
    req.session.destroy();
    req.logout();
    res.redirect('/login');
});

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


//module.exports = app;

app.listen(3000, function () {
 console.log('App listening on port 3000!');
});
