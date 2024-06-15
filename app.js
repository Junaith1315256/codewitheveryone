const express = require("express")
const { createServer } = require ('http')
const { Server } = require('socket.io')
const path = require('path')
const reload = require('reload')
const PORT = process.env.PORT||3000
const app = express();
const server = createServer(app);
const io = new Server(server);
app.use(express.static(path.join('public')));
content = ""
//app.use(express.static('home'))
let codes = "console.log('Welcome to code Editor');"
io.on('connection', (socket) => {
  //io.emit("connectedId")
  socket.on("code",code=>{
    io.emit("code",code)
    codes = code;
  })
  socket.on("edit",(id,code,userId) =>{
    io.emit("edit",id,code,userId)
    
  })
  socket.on("add",(id,sel) =>{
    io.emit("add",id,sel)
    
  })
  socket.on("remove",(id,userId) =>{
    io.emit("remove",id,userId)
    
  })
  socket.on("run",()=>{
    io.emit("run")
  })
  socket.on("mousemove",(x,y,uid)=>{
    io.emit("mousemove",x,y,uid)
  })
  io.emit("codeFile",codes)
});



reload(app).then(function (reloadReturned) {

  server.listen(PORT, () => {
    console.log('server running at http://localhost:'+PORT);
  });
}).catch(function (err) {
  console.error('Reload could not start, could not start server/sample app', err)
})