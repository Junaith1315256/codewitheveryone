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
app.use(express.static(path.join('public')));
content = ""
//app.use(express.static('home'))
let codes = "console.log('Welcome to code Editor');"
function formatCode(str){
  let string = ""
  let text=""
  for (let i = 0; i < str.length; i++) {
    const s = str[i];
    if (text.length == 0&&s == "\n") {
      continue;
    }
    if( i == str.length-1&&s!="\n"){
      text=text+s
    }
    if(text.length > 0){
    if(s=="\n" || i == str.length-1){
      
      string = string+`\ntry{\n${text}\n}catch(e){const [,lineno,colno] = e.stack.match(/(\\d+):(\\d+)/);console.error(e+"\\n\\t"+"at editor.js:"+(parseInt(lineno)/3)+":"+colno)}`
      text = ""
      continue;
    }}
    
    text = text+s
  }
  return string
}
io.on('connection', (socket) => {
  //io.emit("connectedId")
  socket.on("code",code=>{
    io.emit("code",code)
    codes = code;
    content = formatCode(code)
    console.log(code)
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
  io.emit("codeFile",codes)
});

fs.writeFile('public/editor.js', codes, function (err) {
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