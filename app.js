const express = require("express")
const { createServer } = require ('http')
const { Server } = require('socket.io')
const path = require('path')
const reload = require('reload')
const PORT = process.env.PORT||3000
const app = express();
const server = createServer(app);
const io = new Server(server);
const fs =  require("fs")
const { log } = require("console")
app.use(express.static(path.join('public')));
content = ""
//app.use(express.static('home'))
io.on('connection', (socket) => {
  socket.on("code",code=>{
    io.emit("code",code)
    content = `try{\n${code}\n}catch(err){\nconsole.error(err)}`
    fs.writeFile('public/editor.js', content, function (err) {
        if (err) throw err;
    });
  })
  socket.on("edit",(id,code,userId) =>{
    io.emit("edit",id,code,userId)
    
  })
  socket.on("add",(id,userId) =>{
    io.emit("add",id,userId)
    
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
});
content = "\nconsole.log('hello');"
fs.writeFile('public/editor.js', content, function (err) {
    if (err) throw err;
    console.log('Saved!');
});

reload(app).then(function (reloadReturned) {

  server.listen(PORT, () => {
    console.log('server running at http://localhost:'+PORT);
  });
}).catch(function (err) {
  console.error('Reload could not start, could not start server/sample app', err)
})