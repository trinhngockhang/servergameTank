

var express = require('express');
var app = express();

var server  = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.set('port',process.env.PORT || 6969);

var client = [];

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
        data = data.replace("\"","").replace("\"","");
        console.log(data + "agree");
        console.log("type of data " + typeof(data) );
        socket.broadcast.to(data).emit("OTHERPLAYOK");    
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

    socket.on("CHANGESTATUS",(data) => {
        var gaming = data.gaming;
        console.log("da vao game chua????" + typeof(gaming) );
        
        if(currentUser !== undefined){
            for(var i = 0;i < client.length;i++){
                if(socket.id === client[i].id){
                    client[i].gaming = gaming;
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

    socket.on("MOVE",(data) => {
        console.log("da co toc do: " +data.position);
        console.log("do quay: " +data.angle);
        currentUser.position = data.position;
        currentUser.angle = data.angle;
        console.log("id tu move: " + data.id);
        data.id = data.id.replace("\"","").replace("\"","");
        console.log("id tu move sau: " + data.id);
        socket.broadcast.to(data.id).emit("MOVE",currentUser);
        console.log(currentUser.name + "move to " + currentUser.position);
    })

    socket.on("PLAYERFIRE",(data)=>{
        console.log(data.enemyid);
        var first = data.enemyid.substr(0,1);
        console.log("first la: " + first);
        if(first == "\""){
            data.enemyid = data.enemyid.replace("\"","").replace("\"","");
        }
        socket.broadcast.to(data.enemyid).emit("OTHERPLAYERFIRE");
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