import http from "http";
import ws from "websocket"
import redis from "redis";
const APPID = process.env.APPID;
let connections = [];
const WebSocketServer = ws.server
import express from "express"
import ejs from "ejs"
app.set('view engine','ejs')
app.use(express.static('public'))
var app=express()
var names=[]

const subscriber = redis.createClient({
  port      : 6379,              
  host      : 'rds'} );

const publisher = redis.createClient({
  port      : 6379,              
  host      : 'rds'} );
  
 
subscriber.on("subscribe", function(channel, count) {
  //console.log(`Server ${APPID} subscribed successfully to livechat`)
  publisher.publish("livechat", "a message");
});
 
subscriber.on("message", function(channel, message) {
  try{
  //when we receive a message I want t
  //console.log(`Server ${APPID} received message in channel ${channel} msg: ${message}`);
  connections.forEach(c => c.send(APPID + ":" + message))
    
  }
  catch(ex){
    console.log("ERR::" + ex)
  }
});


subscriber.subscribe("livechat");




//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer(app)

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res 
const websocket = new WebSocketServer({
    "httpServer": httpserver
})

app.get('/',function(req,res){
  res.render("index.ejs")
})


httpserver.listen(8080, () => console.log("My server is listening on port 8080"))

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request=> {

    const con = request.accept(null, request.origin)
   // con.on("open", () => console.log("opened"))
    con.on("message", message => {
      if(message.utf8Data.split(" ")[0]=="mycustom")
      {
        names.push(message.utf8Data.split(" ")[1])
        connections.forEach(function(c){
          c.send(message.utf8Data.split(" ")[1]+" has just joined the chat")
        })
      }
      else{
        publisher.publish("livechat", message.utf8Data)
      }
        //publish the message to redis
        //console.log(`${APPID} Received message ${message.utf8Data}`)
       
    })
    
    connections.push(con)
  

})
  
//client code 
//let ws = new WebSocket("ws://localhost:8080");
//ws.onmessage = message => console.log(`Received: ${message.data}`);
//ws.send("Hello! I'm client")


/*
    //code clean up after closing connection
    subscriber.unsubscribe();
    subscriber.quit();
    publisher.quit();
    */
