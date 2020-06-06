const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mysql      = require('sync-mysql');
const connection = new mysql({
  host     : '52.79.44.154',
  user     : 'user',
  password : '1234',
  database : 'nutrient_app'
});

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/login', (req, res) => {
    res.render('login');
});


//TODO: sementic query로 받은 id를 session으로 받아야 함.
app.get('/home', (req, res) => {
    var datas;
    connection.query('select id from user', function (error, rows) {
        if (error) {
            console.log(error);
            return;
        }
        res.send(rows);
    });
    
});

app.post('/add_eaten_food', (req, res) => {
    var date = req.body.date;
    var food = req.body.food;
    var userid = req.body.userid;

    var eaten_nutrients = {};
    var nutrients = [];
    var query = '';
    var rows;

    //유효성 검사 about user, food

    //nutrients 종류 저장
    rows = connection.query("SELECT details from nutrient");
    for(var i = 0; rows[i]; i++) {
        nutrients[i] = rows[i].details;   
    }

    //선택한 food에 대한 영양소 저장
    query = 'SELECT * FROM food_nutrient where food_name_fn="' + food + '"';
    rows = connection.query(query);
    for(var i = 0; rows[i]; i++){
        eaten_nutrients[rows[i].food_nutrient_details] = rows[i].amount;
    }

    //이전까지 먹은 영양소와 합치기
    query = 'SELECT * FROM eaten_nutrient where user_id = "' + userid + '" and date = "' + date + '"';
    rows = connection.query(query);

    if(rows.length != 0) {
        const query_header = 'UPDATE eaten_nutrient SET eaten_amount = eaten_amount+';
        const query_footer = ' and user_id = "' + userid + '" and date = "' + date + '"';

        for(var i = 0; i < nutrients.length; i++) {
            var amount = eaten_nutrients[nutrients[i]];
            if(!amount) amount = 0.0;
            query = query_header + amount + ' WHERE eaten_nutrient_details = "' + nutrients[i] + '" ' + query_footer;
            //update구문
            connection.query(query);
        }

    }
    else {
        const query_header = 'INSERT INTO eaten_nutrient(user_id, date, eaten_nutrient_details, eaten_amount) VALUES("' + userid + '", "' + date + '", "';
        for(var i = 0; i < nutrients.length; i++) {
            var amount = eaten_nutrients[nutrients[i]];
            if(!amount) amount = 0.0;
            query = query_header + nutrients[i] + '", ' + amount + ')';
            //insert구문
            connection.query(query);
        }
    }

    query = 'INSERT INTO eaten_food(user_id, date, food_name_ef) VALUES("' + userid + '", "' + date + '", "' + food + '")';
    connection.query(query);
    res.render('add_success', {userid: userid, food: food, date:date});
});


app.get('/add_eaten_food', (req, res) => {
    var foods = [];
    var rows = connection.query('select name from food');
    var i = 0;
    while(rows[i]) {
        foods[i] = rows[i].name;
        i++;
    }
    res.render('add_eaten_food', {food_names:foods});
    
});

app.get('/dice', (req, res) => {
    res.send("Hello, dice <img src='/dice.jpg'>");
});





app.listen(3000, ()=>{
    console.log("Connected 3000 port!");
});