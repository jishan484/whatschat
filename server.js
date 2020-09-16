const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require("fs");
const session = require("sessid");  //for managing session in express and socketio in 1 library
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(session.start);
// init sqlite db
const dbFile = "./.data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);
init_database();

//handle get and post requests
function abc(p,p2)
{
  
}
(p,p2) => { }
app.use(express.static("public"));
app.get("/home", (req, res) => { if (check("/home", res)) res.sendFile(`${__dirname}/views/home.html`); })
app.get("/", (req, res) => { if (check("/", res)) res.sendFile(`${__dirname}/views/index.html`); });
app.post("/login", (req, res) => { login(req, res); });
app.post("/username", (req, res) => { username(req, res); });
app.post("/register", (req, res) => { register(req, res); });
app.post("/search", (req, res) => { search(req, res); });
app.post("/send_request", (req, res) => { send_request(req, res); });
app.post("/friends", (req, res) => { friends(req, res); });
app.post("/accept_request", (req, res) => { accept_request(req, res); });
app.post("/delete_friends", (req, res) => { delete_driends(req, res); });
app.post("/getdata", (req, res) => { getdata(req, res); });
app.post("/getchat", (req, res) => { getchat(req, res); });
app.post("/edit_profile", (req, res) => { user_profile_update(req, res); });
app.get("/img/:link", (req, res) => { send_images(req, res); });
app.get("/my_profile_img/:img", (req, res) => { send_my_image(req, res); });
app.get("/friends_data", (req, res) => { friends_data(req, res); });
app.get("/logout", (req, res) => { session.destroy();res.redirect("/"); });


// handle socket connecions [chat and videos]
var token = {};
io.on('connection', (socket) => {
  session(socket); //to manage session in socket
  var room = makeid();
  var user = session.ifset('user');
  if(session.ifset('user')&& typeof(token[user])=='undefined'){
      token[user] = room;
      socket.emit("gettoken",{secret:room,id:user});
      socket.join(room);
  }
  
  socket.on("send",(data)=>{
    var d = new Date();
    session(socket);
    var user = session.ifset('user');
    var datas = {sender:user , message:data.message.replace(/[>,/,',",<]/ig, "") , time:d.getTime()}
    if(user && token[user]==data.token)
      {
        if(typeof(token[data.uid])!='undefined'){
          io.to(token[data.uid]).emit("receive",datas);
          update_db(datas,data.uid,1);
        }
        else update_db(datas,data.uid,0);
      }
  });
  
  socket.on("new_request", (data) => {
    console.log(data , typeof (token[data.uid]))
      if (typeof (token[data.uid]) != 'undefined') {
        io.to(token[data.uid]).emit("new_request", "hello friend");
      }
  });

  socket.on("status",(uid)=>{
    socket.emit("status",typeof(token[uid]) != 'undefined');
  })

  socket.on("call_req",(touid)=>{
    session(socket);var user = session.ifset('user');
    console.log("call initiated for :",touid,"from",user);
    io.to(token[touid]).emit("call_req",{fromuid:user , touid:touid});
  });
  socket.on("call_accept",(to_uid)=>{
    io.to(token[to_uid]).emit("call_accept", true);
  })
  socket.on("signal",(data)=>{
    io.to(token[data.touid]).emit("signal",data.signal);
  })
  socket.on("call_end",(uid)=>{
    io.to(token[uid]).emit("call_end","just do it");
  })
  socket.on("end_call_line_busy",(touid)=>{
    io.to(token[touid]).emit("end_call_line_busy",true);
  })
  socket.on('disconnect', () => {
    session(socket);
    var user = session.ifset('user');
    if(typeof(token[user])!='undefined')
      delete token[user];
  });
  
});



// init database
function init_database() {
  db.serialize(() => {
    if (!exists) {
      // db.run("CREATE TABLE users (uid TEXT , email TEXT )");
      db.run("CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT , email TEXT , password TEXT, name TEXT)");
      console.log("New table users created!");
      db.run("CREATE TABLE friends (id INTEGER PRIMARY KEY AUTOINCREMENT,uid VARCHAR , fid VARCHAR , mid VARCHAR, status INTEGER)");
      console.log("New table friends created!");
      db.run("CREATE TABLE message (id INTEGER PRIMARY KEY AUTOINCREMENT,mid VARCHAR , sid VARCHAR , message TEXT,time TEXT, status INTEGER)");
      console.log("New table message created!");
    }
  });
}

http.listen(3000, () => {
  console.log("server running on port 3000");
})

// extra funtions
// for images
function send_images(req,resp)
{
  var data = req.params.link;
  if(fs.existsSync("datas/"+data))
    resp.sendFile(`${__dirname}/datas/`+data);
  else resp.sendFile(`${__dirname}/public/profile.png`);
}
function send_my_image(req,resp)
{
  var data = session.ifset("user")+".png";
  if(fs.existsSync("datas/"+data))
    resp.sendFile(`${__dirname}/datas/`+data);
  else resp.sendFile(`${__dirname}/public/profile.png`);
}
function friends_data(req,res)
{
  var select = "SELECT COUNT(*) as p FROM friends WHERE fid='"+session.ifset('user')+"' AND status=0";
  db.all(select, (err, rows) => {
    if (rows && rows[0]!=null) {
      res.send({ "data": rows[0].p, "status": true });
    }
    else res.send({ "data": 0, "status": false });
  });
}
//  for user profile data
function user_profile_update(req,res)
{
  switch (req.body.type)
  {

    case "img":
      update_profile_image(req,res);
      break;
    case "info":
      update_profile_info(req, res);
      break;
    default:
      res.send({err: "No operation selected !"});
  }
}
function update_profile_image(req, res){
  if (typeof req.body.file == 'undefined'){res.send({err:"send the file !"}); return;}
  var data = req.body.file, base64Data, binaryData;
  base64Data = data.replace(/^data:image\/png;base64,/, "");
  base64Data += base64Data.replace('+', ' ');
  if (typeof Buffer.from === "function") {
    binaryData = Buffer.from(base64Data, 'base64'); // new version of nodejs
  } else {
    binaryData = new Buffer(base64Data, 'base64'); // old version of nodejs
  }
  var dir = "datas/" + session.ifset("user") + ".png";
  if (!fs.existsSync("datas/")) {
    fs.mkdirSync("datas/");
  }
  fs.writeFile(dir, binaryData, "binary", function (err) {
    if(err) res.send({err:err});
    else res.send({err:false});
  });
}
function update_profile_info(req, res)
{
  var name = req.body.name;
  var password = req.body.password , update='',resp='';
  if(name!='' && password!=''){
  update = `UPDATE users SET name='`+name+`' , password='`+password+`' WHERE uid='`+session.ifset("user")+`'`;
  resp = "Name and password updated !";
  }
  else if (name != '' && password == '') {
    update = `UPDATE users SET name='` + name + `' WHERE uid='` + session.ifset("user") + `'`;
    resp = "Name updated !";
  }
  else if (name == '' && password != '') {
    update = `UPDATE users SET password='` + password + `' WHERE uid='` + session.ifset("user") + `'`;
    resp = "Password updated !";
  }
  else{
    res.send({err:"Empty inputs !"}); return;
  }
  db.run(update, (err) => { if(err) res.send({err:err}); else res.send({err:false,text:resp}) });
}

// <script>var data=''; join(data);</script>
// for login
function login(req, res) {
  var select = "SELECT * from users where uid='" + req.body.username.trim().replace(/[&\/\\#,! @#$^+()$~%;|'":*?<>{}]/ig, "") + "' and password='" + req.body.password + "'";
  db.all(select, (err, rows) => {
    if (rows && rows[0] != null) {
      res.send({ "data": "success", "login": true });
      session.set({ user: rows[0].uid });
    }
    else res.send({ "data": "Username & password not match", "login": false });
  });
}
function username(req, res) {
  var select = "SELECT * from users where uid='" + req.body.username + "'";
  db.all(select, (err, rows) => {
    if (rows && rows[0] != null) res.send({ "data": "username already taken", "username": false });
    else res.send({ "data": "Username saved", "username": true });
  });
}
function register(req, res) {
  var select = "SELECT * from users where email='" + req.body.email + "' or uid='" + req.body.username + "'";
  var insert = 'INSERT INTO users (uid,email,password,name)'
    + ' VALUES ("' + req.body.username.trim().replace(/[&\/\\#,! @#$^+()$~%;|'":*?<>{}]/ig, "") + '","' + req.body.email + '","' + req.body.password + '","' + req.body.name + '")';
  db.all(select, (err, rows) => {
    if (rows && rows[0] != null)
      res.send({ "data": "Already registerd as " + rows[0].uid, register: false });
    else {
      db.serialize(() => {
        db.run(insert, (err) => { if (err) console.log(err) });
        session.set({ user: req.body.username });
        res.send({ "data": "Success", "register": true });
        res.end();
        if(req.body.img && req.body.file != null && req.body.file != '')
          {
            save_image(req);
          }  
      });
    }
  });
}

function save_image(req)
{
  if (typeof req.body.file == 'undefined'){res.send({err:"send the file !"}); return;}
  var data = req.body.file, base64Data, binaryData;
  base64Data = data.replace(/^data:image\/png;base64,/, "");
  base64Data += base64Data.replace('+', ' ');
  if (typeof Buffer.from === "function") {
    binaryData = Buffer.from(base64Data, 'base64'); // new version of nodejs
  } else {
    binaryData = new Buffer(base64Data, 'base64'); // old version of nodejs
  }
  var dir = "datas/" + req.body.username+".png";
  if (!fs.existsSync("datas/")) {
    fs.mkdirSync("datas/");
  }
  fs.writeFile(dir, binaryData, "binary", function (err) {console.log(err)});
}
function check(path, res) {
  if (session.ifset("user") && path == "/home")
    return true;
  if (!session.ifset("user") && path == "/")
    return true;
  if (session.ifset("user") && path == "/") res.redirect("/home");
  if (!session.ifset("user") && path == "/home") res.redirect("/");
  return false;
}

function search(req, res) {
  if (session.ifset("user") && req.body.search != "") {
    var ignore1 = "(SELECT fid FROM friends WHERE friends.uid='"+session.ifset('user')+"')";
    var ignore2 = "(SELECT uid FROM friends WHERE fid='"+session.ifset('user')+"')";
    var select = "SELECT uid,name FROM users WHERE (uid LIKE $search AND uid NOT IN "+ignore1+
        " AND uid NOT IN "+ignore2+" AND uid!='"+session.ifset('user')+"') OR (name LIKE $search AND uid NOT IN "+ignore1+
        " AND uid NOT IN "+ignore2+" AND uid!='"+session.ifset('user')+"')";
    // var select = "SELECT uid,name FROM users WHERE uid LIKE $search AND uid!='"+session.ifset('user')+"'";
    var pat = { $search: req.body.search + "%" };
    db.all(select,pat, (err, rows) => {
      res.send(rows);
    })
  }
  else res.send("");
}

function send_request(req, res) {
  if (session.ifset("user") && req.body.send != "" && req.body.send != session.ifset('user')) {
    var select = "SELECT * FROM friends WHERE (fid='"+req.body.uid+"' AND uid='"+session.ifset('user')+"'"+
        ") OR (fid='"+session.ifset('user')+"' AND uid='"+req.body.uid+"')";
    var insert = "INSERT INTO friends (uid,fid,mid,status)" +
      "VALUES ('" + session.ifset('user') + "','" + req.body.uid + "','" +
      session.ifset('user') + req.body.uid + "',0)";
    db.all(select, (err, rows) => {
      if (rows && rows[0] != null)
        res.send({ send: false });
      else {
        db.serialize(() => {
          db.run(insert, (err) => { if (err) console.log(err) });
          res.send({ send: true });
        });
      }
    });
  }
  else res.send("You are not authorized");
}

function accept_request(req, res)
{
  if (session.ifset("user") && req.body.uid != "" && req.body.uid != session.ifset('user')) {
    var select = "SELECT * FROM friends WHERE (uid='"+session.ifset('user')
      +"' AND fid='"+req.body.uid+"' AND status=0) OR (uid='"+req.body.uid
      +"' AND fid='"+session.ifset('user')+"' AND status=0)";
    var modify = "UPDATE friends SET status=1 WHERE (uid='"+session.ifset('user')
      +"' AND fid='"+req.body.uid+"' AND status=0) OR (uid='"+req.body.uid
      +"' AND fid='"+session.ifset('user')+"' AND status=0)";
    db.all(select, (err, rows) => {
      if (!rows && rows[0] == null)
        res.send({ accept: false });
      else {
        db.serialize(() => {
          db.run(modify, (err) => { if (err) console.log(err) });
          res.send({ accept: true });
        });
      }
    });
  }
  else res.send("You are not authorized");
}

function friends(req, res)
{
  var select = "SELECT users.uid,users.name,friends.status FROM friends,users WHERE (friends.fid='"+session.ifset('user')
  +"' AND "+ " friends.status=0  AND friends.uid = users.uid) OR " +
   "(friends.uid='" + session.ifset('user') +"' AND friends.status=1  AND friends.fid = users.uid)"+
   " OR (friends.fid='" + session.ifset('user') +"' AND friends.status=1  AND friends.uid = users.uid)";
  db.all(select, (err, rows) => { res.send(rows); });
}

function delete_driends(req,res)
{
  var remove = "DELETE FROM friends WHERE (uid='"+session.ifset('user')+"' AND fid='"+req.body.uid+"' AND status=1) OR"+
      " (uid='"+req.body.uid+"' AND fid='"+session.ifset('user')+"' AND status=1)";
  db.run(remove, (err) => { res.send({delete:true}); });
}

function getdata(req,res)
{
  var datas=[],count=0,index=0;
  var user = session.ifset('user');
  var select = "SELECT * FROM friends,users WHERE (friends.uid='"+user+"' AND"+
      " friends.status=1 AND friends.fid=users.uid ) OR"+
      " (friends.fid='"+user+"' AND friends.status=1 AND friends.uid=users.uid)";
  db.all(select, (err, rows) => {
    if(rows && rows!=null)
      {
        for(var i=0;i < rows.length;i++)
          {
            datas[i]={uid:rows[i].uid,name:rows[i].name};
            var get = "SELECT "+i+","+rows.length+",MAX(id),message,time,status FROM message WHERE mid='"+rows[i].mid+"'";
            db.all(get, (errs, rowd)=>{
                if(errs==null && rowd && rowd!=null)
                  {
                    index = Object.keys(rowd[0])[0];
                    var to = Object.keys(rowd[0])[1];
                    datas[index]["message"] = rowd[0].message;
                    datas[index]["time"] = rowd[0].time;
                    datas[index]["status"] = rowd[0].status;
                    // console.log(count,index,to)
                    count++;
                    if(count >= to) {res.send(datas);}
                  }
              else console.log("Something went wrong")
            });
          }
      }else res.send("[{}]");
  });
}
function getchat(req,res)
{
  var selectuser = "SELECT * FROM users WHERE uid='"+req.body.uid+"'";
  var mid1 = session.ifset('user')+req.body.uid;
  var mid2 = req.body.uid+session.ifset('user');
  var selectchats = "SELECT * FROM message WHERE mid='"+mid1+"' OR mid='"+mid2+"'";
  var datas=[];
  db.all(selectuser, (errs, row) => {
    if(row && row[0]!=null)
    {
      db.all(selectchats, (errs, rows) => {
        if (rows && rows[0] != null) {
          rows[0]["name"] = row[0].name;
          res.send(rows);
          clear_old(rows[0].mid,100);
        } else res.send({name:row[0].name,message:null});
      });
    }else res.send("Sorry !");
  });
}

function update_db(datas,fid,status)
{
      var select = "SELECT mid FROM friends WHERE (uid='"+session.ifset('user')+"' AND"+
      " status=1 AND fid='"+fid+"') OR (fid='"+session.ifset('user')+"' AND status=1 AND uid='"+fid+"')";
      db.all(select, (errs, row) => {
        if(row && row[0]!=null)
          {
            var mid = row[0].mid;
            var insert = "INSERT INTO message (mid,sid,message,time,status) values ('"+
            mid+"','"+datas.sender+"','"+datas.message+"','"+datas.time+"','"+status+"')";
            db.run(insert,(err)=>{if(err)console.log(err)});
          }
      });
}


function time() //for indian time zone
{
  var date = new Date();
  var offset = (330 - date.getTimezoneOffset())*60000;
  date = new Date(date.getTime() + offset)
  return date;
}
function makeid() {
  var length = 16;
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function clear_old(mid,limit)
{
  var select = "DELETE FROM message WHERE mid='"+mid+"' AND id NOT IN "+
      "(SELECT id FROM message WHERE mid='"+mid+"' ORDER BY id DESC LIMIT "+limit+")"; 
  db.run(select,(err)=>{if(err)console.log(err)})
} 