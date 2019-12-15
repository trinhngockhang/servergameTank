

var express = require('express');
var app = express();

var server  = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port',process.env.PORT || 6969);

var client = [];

app.get("/",()=>{
    res.send("da ket noi");
})

app.get('/user',(req,res) =>{
    res.send("aaaa");
    console.log("co nguoi load");
})

io.on("connection",function(socket){
    var currentUser;
    socket.on("USER_CONNECT",function(){     
        console.log("User connected");
        var data = {
            id : socket.id
        }
        socket.emit("GETID",data);
        for(var i= 0;i < client.length;i++){
            //socket.emit("USER_CONNECTED",{name:client[i].name,position: client[i].position});
            console.log("User name " + client[i].name + "is connected");
        }
    })
    socket.on("AGREE",(data) =>{
       console.log("data truoc " + data);
       var userBusy;
       
        if(currentUser !== undefined){
            for(var i = 0;i < client.length;i++){
               // var id = JSON.stringify(client[i].id);
                var id = client[i].id;
                console.log(typeof(id));
                console.log("id client: " + id + " id user " + data);
                if(data == id){
                    console.log("dung r " + client[i].gaming);
                   if(client[i].gaming == "3" || client[i].gaming == "2"){
                       console.log("dung gaming r");
                       userBusy = true;
                       i = client.length;
                   }                  
                }
            }
        }

        if(userBusy){
            socket.emit("BUSY");
        }else{
            socket.emit("NOTBUSY");
            data = data.replace("\"","").replace("\"","");
            console.log(data + "agree");
            console.log("type of data " + typeof(data) );
            var dataBack  = {
                id:socket.id
            }
            socket.broadcast.to(data).emit("OTHERPLAYOK",dataBack); 
        }           
    })

    socket.on("PLAY",(data) => {     
        currentUser = {
            position:data.position,
            name : data.name,
            idEnemy: data.enemyid
        }   
        console.log("id tu client: " + data);
        console.log(socket.id+ " Da vao play!!!!!!");
        console.log("id enemy: " +currentUser.idEnemy);
       // client.push(currentUser);     
      //  console.log(client); 
        socket.emit("PLAY",currentUser);
     //   var length = client.length;
       // socket.emit("LISTWAITING",{client,length});
        //socket.broadcast.emit("LISTWAITING",{client,length});

        currentUser.idEnemy = currentUser.idEnemy.replace("\"","").replace("\"","");
        console.log("id enemy sau: " +currentUser.idEnemy);
        socket.broadcast.to(currentUser.idEnemy).emit("USER_CONNECTED",currentUser);     
    })
    socket.on("CHARACTER_SELECT", (data) => {
        socket.emit("CHARACTER_SELECT",currentUser);    
    })
    socket.on("WAITING", (data) => {
        console.log({data});
        var gaming = data.gaming;
        var character = data.character;
        var myPlayer = {
            character: character
        };
        var enemyPlayer = {
            character: "1"
        };
        if(currentUser !== undefined){
            for(var i = 0;i < client.length;i++){
                if(socket.id === client[i].id){
                    client[i].gaming = gaming;
                    client[i].character = character;
                    myPlayer.name = client[i].name;
                    console.log("User " + client[i].name + " dang " + gaming + "character:" + character);                   
                }
            }
        }
        var enemyId = data.id.replace("\"","").replace("\"","");
        console.log('id player 2', enemyId);
        
        if(currentUser !== undefined){
            for(var i = 0;i < client.length;i++){
               // var id = JSON.stringify(client[i].id);
                var id = client[i].id;
                if(enemyId.toString() == id.toString()){
                    console.log("dung r " + client[i].gaming);
                   if(client[i].gaming == "2"){
                       console.log("thang kia xong r");
                       enemyPlayer.name = client[i].name;
                       enemyPlayer.character = client[i].character.replace("\'","").replace("\'","");
                       console.log({enemyPlayer});
                       console.log({myPlayer});
                       socket.emit("PLAY");
                       socket.broadcast.to(enemyId).emit("PLAY");
                       socket.emit("USER_CONNECTED", enemyPlayer);
                       socket.broadcast.to(enemyId).emit("USER_CONNECTED",myPlayer); 
                   }                  
                }
            }
        }
    })
    socket.on("CHANGESTATUS",(data) => {
        var gaming = data.gaming;
        console.log("da vao game chua????" + typeof(gaming) );
        if(currentUser !== undefined){
            for(var i = 0;i < client.length;i++){
                if(socket.id === client[i].id){
                    client[i].gaming = "3";
                    console.log("User " + client[i].name + " dang " + gaming);                   
                }
            }
        }
        var length = client.length;
        socket.emit("LISTWAITING",{client,length});
        socket.broadcast.emit("LISTWAITING",{client,length});
    }
    )
    socket.on("GETUSER",(data) =>{
        currentUser = {
            position:data.position,
            name : data.name,
            gaming: data.gaming,
            id : socket.id   
        }   
        client.push(currentUser);
        console.log(client); 
        var length = client.length;
        socket.emit("LISTWAITING",{client,length});
        socket.broadcast.emit("LISTWAITING",{client,length});
    })

    socket.on("REFRESH",(data) => {
        console.log("rf list");
        var length = client.length;
        socket.emit("LISTWAITING",{client,length});
    })

    socket.on("SENDREQUEST",(data) =>{
       console.log("client gui len ne: " + JSON.stringify(data));
       var cup = {
           id : data.enemyid,
           name : data.name,
           enemyid: data.myid
       }
       cup.id = JSON.stringify(cup.id);
       cup.id = cup.id.replace("\"","").replace("\"","");
       cup.enemyid = JSON.stringify(cup.enemyid);
       cup.enemyidid = cup.enemyid.replace("\"","").replace("\"","");
       console.log("id client gui len ne: " + cup.id);
       var name = cup.name;
       socket.broadcast.to(cup.id).emit("BEFIGHT",cup);
    })
    socket.on("CHANGEVELOCITY", (data) => {
        //console.log("data nhan dc khi thay doi vi tri", data.id);
        // console.log("huong la", data.direction);
        data.id = data.id.replace("\"","").replace("\"","");
        var obj ={
            direction :data.direction
        }
        socket.broadcast.to(data.id).emit("OTHERPLAYERCHANGEVELOCITY",obj);
        socket.emit("PERMISMOVE", obj);
    })
    
    socket.on("UPDATEPOSITION",(data) => {
        console.log("nhan vi tri ne", data);
        currentUser.position = data.position;
        currentUser.angle = data.angle;
        data.id = data.id.replace("\"","").replace("\"","");
        socket.broadcast.to(data.id).emit("UPDATEPOSITION",currentUser);
        //console.log(currentUser.name + "move to " + currentUser.position);
    })

    socket.on("PLAYER_H_PUNCH",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        console.log("thanng " + data.enemyid + " vua dam");
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_H_PUNCH");
        socket.emit("PERMIS_H_PUNCH");
    })

    socket.on("PLAYER_KICK",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        console.log("thanng " + data.enemyid + " vua da");
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_KICK");
        socket.emit("PERMIS_KICK");
    })

    socket.on("PLAYER_ATTACK",(data)=>{
        console.log("Nhan action danh");
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_ATTACK");
        socket.emit("PERMIS_ATTACK");
    })

    socket.on("PLAYER_JUMP",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_JUMP");
        socket.emit("PERMIS_JUMP");
    })

    socket.on("PLAYER_BLOCK",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_BLOCK");
        socket.emit("PERMIS_BLOCK");
    })

    socket.on("PLAYER_IDLE",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_IDLE");
        socket.emit("PERMIS_IDLE");
    })
    
    socket.on("PLAYER_DOWN",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        //console.log("thanng " + data.enemyid + " vua ngoi");
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_DOWN");
    })
    socket.on("PLAYER_UP",(data)=>{
        var first = data.enemyid.substr(0,1);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        //console.log("thanng " + data.enemyid + " vua dung len");
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYER_UP");
        socket.emit("PERMIS_UP");
    })
    socket.on("disconnect",() => {
        socket.broadcast.emit("USER_DISCONNECTED", currentUser);
        if(currentUser !== undefined){
            for(var i = 0;i < client.length;i++){
                if(client[i].name === currentUser.name){
                    console.log("User " + client[i].name + " dis");
                    client.splice(i,1);
                }
            }
        }
        var length = client.length;
        socket.emit("LISTWAITING",{client,length});
        socket.broadcast.emit("LISTWAITING",{client,length});
    })
})

server.listen(app.get('port'),() => {
    console.log("listen on 6969");
})