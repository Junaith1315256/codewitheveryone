const isAlpha =  /^[a-zA-Z0-9]+$/;
function setCaretPos(div,pos = -1){
    div.innerText=div.textContent.length == 0?" ":div.textContent;
    pos = pos < 0?(div.childNodes[0].length):pos;
    div.contentEditable = "true"
    console.log(pos,div.childNodes[0].length);
    const setPos  = document.createRange();
    const set = window.getSelection()
    setPos.setStart(div.childNodes[0],pos);
    setPos.collapse(true);
    set.removeAllRanges();
    set.addRange(setPos)
    div.focus()
}
window.addEventListener("paste",(e)=>{
    e.preventDefault();
    var codes = (e.originalEvent || e).clipboardData.getData('text/plain');
   socket.emit("paste",codes)
})
const Log_Container = document.getElementById("runner_container")

const createLog = (msg,type = "")=>{
    const LOGS = document.createElement("div")
    LOGS.className = `logs`
    let ostring = ""
    for (let i = 0; i < msg.length; i++) {
        const s = msg[i];
       
        if(s=="\t"){
            ostring=ostring+"\xa0\xa0\xa0\xa0\xa0\xa0\xa0";
            continue
        }
        ostring= ostring+s
    }
    Log_Container.appendChild(LOGS)
    
    if(type){
        const span = document.createElement("span")
        span.className = "material-icons icon "+type
        span.innerText = type
        span.style.fontSize = "15px"
        LOGS.appendChild(span)
    }
    const span1 = document.createElement("span")
    span1.className = type
    span1.innerText = ostring;
    LOGS.appendChild(span1)
}
/* console.log = (...message)=>{
    let str = ""
    for (const msg of message) {
        str = str + " "+msg
    }
    createLog(str)
} */

console.warn = (message)=>{
    createLog(message,"warning")
}
console.error = (...message)=>{
    let str = ""
    for (const msg of message) {
        str = str + " "+msg
    }
    createLog(str,"error")
} 
const socket = io();
let userId = Math.floor(Math.random()*100000000)
let CURRENT_INPUT = 0;
const INPS = document.getElementsByClassName("lines")
let inputs = "" 
function getInputs(){
    inputs = ""
    for (let i = 0; i < INPS.length; i++) {
        const line = INPS[i];
        inputs = inputs+"\n"+line.innerText
    }
}




const RUN =  document.getElementById("run");
const RunTheProgram = ()=>{
    const logs = document.getElementsByClassName("logs")
    for (let i = 0; i < logs.length; i++) {
        const e = logs[i];
        Log_Container.removeChild(e)
        i--;
    }
    RUN.innerText = "Running"
    RUN.className = "run_clicked"
    getInputs()
    socket.emit("code",inputs)
    try { 
        const runScript = new Function(inputs);
        const result = runScript()
    } catch (e) {
        const [,lineno,colno] = e.stack.match(/>:(\d+):(\d+)/)
        console.error(`${e}\n\tat app.js:${parseInt(lineno)-3}:${colno}`)
    }

}
RUN.addEventListener("click",()=>{

    if(RUN.className == "run_unclicked"){
        socket.emit("run")
         RUN.innerText = "Running"
    RUN.className = "run_clicked"
    setTimeout(()=>{
        RUN.innerText = "Run"
        RUN.className = "run_unclicked"
   },1000)
    }
   
    
    
   
})
const RunColorCode = ()=>{
    colorCode.innerHTML = ""
    
    let bigComment = false
    
    for (let i = 0; i < INPS.length; i++) {
        const div =  document.createElement("div")
        let keyword = ["for","if","else","while","import","break","continue"] 
        let keyword1 = ["const","function","class","let","new"]
        let keyword3 = [1,2,3,4,5,6,7,8,9,0]
        let str =  INPS[i].textContent
        let text = ""
        let comment = false
        let dcolor = bigComment?Color.darkgreen: Color.default
        let strstart = false
        for (let j = 0; j < str.length; j++) {
            const s = str[j];
            if(text.includes("$")&&text.includes("{")&&s=="}"){
                strstart == true;
                text=text+s
                Span(text,dcolor,div)
                text= ""
                continue;
            }
            if(str[j-1]&&str[j-2]){
               if (str[j-2]=='*'&&str[j-1]=="/" &&bigComment){
                    Span(text,Color.darkgreen,div)
                    text=""
                    bigComment=false
                    comment=false
                    dcolor = Color.default;
               }
            }
            
            if(str[j+1]){
            if((str[j+1]=='*'&&s=="/") ||bigComment ){
                bigComment = true
                dcolor = Color.darkgreen;
            }
            if((str[j+1]=='/'&&s=="/")||(str[j+1]=='*'&&s=="/")){
                Span(text,Color.default,div);
                text = ""
            }
                if((str[j+1]=='/'&&s=="/") || comment){
                comment = true;
                dcolor = Color.darkgreen;
                }
            }
            if (comment || bigComment) {
                text=text+s
                continue
            }
            if (s == '"'||s=="'" || s == '`'||strstart) {
                strstart = true
                text = text+s
            }
            if(str[j+1]&&str[j+2]){
                if(str[j+1]=="$" && str[j+2]=="{"){
                    Span(text, Color.orange,div)
                    strstart = false
                    text = ""
                    continue;
                }
            }
            if((text.includes('"')&&text.includes('"',1))||((text.includes('}')||text.includes('`'))&&text.includes('`',1))||(text.includes("'")&&text.includes("'",1))){
                Span(text, Color.orange,div)
                strstart = false
                text = ""
                continue;
            }
            if(strstart)continue
            if(s == "." && text.length > 0){
                text = text+s
                Span(text, Color.blue,div)
                text = ""
                continue
            }
            
            if(!isAlpha.test(s)&& text.length > 0){
                let cond  = false
                
                for (let k = 0; k < keyword.length; k++) {
                    const ke = keyword[k];
                    if(text == ke){
                        Span(text+s,Color.purple,div)
                        text = ""
                        break;
                    }
                }
                for (let k = 0; k < keyword1.length; k++) {
                    const ke = keyword1[k];
                    if(text == ke){
                        cond = true
                        Span(text+s,Color.darkblue,div,"italic")
                        text = ""
                        break;
                    }
                }
                if(s == "(" && cond){
                    Span(s,Color.yellow,div)
                }
                if(s == "{" && cond){
                    Span(s,Color.default,div)
                }
                if(s == "(" && text.length > 0){
                    text = text+s
                    Span(text, Color.yellow,div)
                    text = ""
                    continue
                }
                if(s == "{" && text.length > 0){
                    text = text+s
                    Span(text, Color.default,div)
                    text = ""
                    continue
                }
                if (!cond) {
                 Span(text,Color.default,div)
                    text = ""
                }
                if(cond)continue
                
                if(s==")" && text.length > 0){
                    Span(text,Color.default,div)
                    text = ""
                    Span(s, Color.yellow,div)
                    continue
                }else if(s==")"){
                    Span(s, Color.yellow,div)
                    continue;
                }
            
            if(s=="("){
                Span(s, Color.yellow,div)
                continue
            }
        }
            let next = false
            for (let k = 0; k < keyword3.length; k++) {
                const ke = keyword3[k];
                 if (s==ke && text.length == 0) {
                    Span(s,Color.green,div)
                    next = true
                    break;
                }
            }
            if(next)continue
          
            if(!isAlpha.test(s)){
                Span(text,dcolor,div)
                Span(s,Color.white,div)
                text = ""
                continue;
            }
           
            text = text+s

        }
        
        Span(text,dcolor,div)
        
    }
   
}

const createInput = (msg = "")=>{
    const texts = document.getElementById("texts")
    const Input =  document.createElement("div")
    Input.type = "text"
    Input.className = "lines"
    Input.id = `line${INPS.length}`
    Input.spellcheck = false;
    Input.autocomplete = "off"
    Input.contentEditable = "true"
    let text = ""
    for (let i = 0; i < msg.length; i++) {
        const s = msg[i];
        if(s == " "){
            text= text+"\xa0"
            continue;
        }
        text  = text +s
    }
    Input.innerText = text
    //Input.id = `line${num}`
    Input.addEventListener("click",(e)=>{
        const l = e.currentTarget
        CURRENT_INPUT = l
        CURRENT_INPUT.contentEditable = "true"
    })
    texts.appendChild(Input)
}
const removeInput = (inp = CURRENT_INPUT)=>{
    const texts = document.getElementById("texts")
    let d = 0
    for (let i = 0; i < INPS.length; i++) {
        const inps = INPS[i];
        if(inp == inps){
            d = i
        }
    }
    let leng =  INPS[d-1].textContent.length
    INPS[d-1].innerText = INPS[d-1].textContent+inp.textContent
    setCaretPos(INPS[d-1],leng)
    
    texts.removeChild(inp)
    
}
const createNum = ()=>{
    const numc = document.getElementById("num_container")
    const num = document.createElement("div")
    num.innerText = INPS.length;
    num.className = "nums"
    numc.appendChild(num)
        
}
const removeNum = ()=>{
    const numc = document.getElementById("num_container")
    const num = document.getElementsByClassName("nums")
    numc.removeChild(num[num.length-1])
}
for (let i = 0; i < INPS.length; i++) {
    const line = INPS[i]
    INPS[i].addEventListener("click",(e)=>{
        const l = e.currentTarget
        CURRENT_INPUT = l
    })
}
window.onkeydown = (e)=>{
    CURRENT_INPUT = document.activeElement;
    let keys = e.key
    if(keys == "Enter"){
        socket.emit("add",CURRENT_INPUT.id,window.getSelection().focusOffset)
        CURRENT_INPUT.contentEditable = "false"
        console.log(keys);
    }
    if(keys == "Backspace"&&window.getSelection().focusOffset == 0){
       if(CURRENT_INPUT){ 
        socket.emit("remove",CURRENT_INPUT.id,0)
        }
    }
    
    
    let mirros = ["(",")","{","}","[","]","'","'",'"','"',"`","`",]
    for (let i = 0; i < mirros.length; i+=2) {
        if (keys == mirros[i]) {
    let leng =  CURRENT_INPUT.textContent.length
            CURRENT_INPUT.innerText = CURRENT_INPUT.textContent+mirros[i+1]
            setCaretPos(CURRENT_INPUT,leng);
            break;
        }
        
    }
  
    

}



socket.on("edit",(id,code,uid)=>{
    if(uid != userId){
const line =  document.getElementById(id);
line.innerText = code;
RunColorCode()
}
})

socket.on("remove",(id,sel)=>{
        const currenInput=document.getElementById(id)
        removeInput(currenInput);
        removeNum()
        RunColorCode();
})

socket.on("add",(id,sel)=>{
    const currenInput=document.getElementById(id)
    const inp_value =  currenInput.innerText;
    let text = ""
    for (let i = sel; i <inp_value.length; i++) {
        let s = currenInput.innerText[i];
        if(s == " "){s="\xa0"}
        text = text+s
    }
    createInput(text)
    createNum()
    if(currenInput != INPS[INPS.length -2]){
        for (let i = INPS.length; i >= 0; i--) {
            if(currenInput == INPS[i-1]){
                INPS[i].innerText=text
            break;}
            if(INPS[i] && INPS[i-1]){
                INPS[i].innerText = INPS[i-1].textContent
                setCaretPos(INPS[i-1],1)
            }
        }
    }else{
        
        setCaretPos(INPS[INPS.length -1],0)
    }
    currenInput.innerText = inp_value.slice(0,sel)
    RunColorCode()
    
})

socket.on("run",()=>{
    RunTheProgram()
});
const Color = {
    darkblue:"#5f5fff",
    blue:"#1aa7ff",
    default:"#00ffff",
    green:"#7be495",
    purple:"#ff00ff",
    orange:"#f79256",
    yellow:"#ffdd00",
    white:"#ffffff",
    darkgreen: "#007542"
}
const colorCode  = document.getElementById("color_code")
function Span(msg,color,div,italic = "normal"){
   let text = ""
   for (let i = 0; i < msg.length; i++) {
    let s = msg[i];
    if(s==" "){
     s = "\xa0"
    }
    text=text+s
   }
    if(text.length > 0){
    const span = document.createElement("span")
    span.innerText = text;
    span.style.color = color;
    span.style.fontStyle = italic
    div.appendChild(span)}
}
window.oninput = ()=>{
    socket.emit("edit",CURRENT_INPUT.id,CURRENT_INPUT.innerText,userId)
    RunColorCode()
   
}

window.addEventListener("mousemove",(e)=>{
    socket.emit("mousemove",e.x,e.y,userId)
})
window.addEventListener("touchmove",(e)=>{
    socket.emit("mousemove",e.touches[0].clientX,e.touches[0].clientY,userId)
})
window.addEventListener("touchstart",(e)=>{
    socket.emit("mousemove",e.touches[0].clientX,e.touches[0].clientY,userId)
})

socket.on("mousemove",(x,y,uid)=>{
    if(uid != userId){
        const cur = document.getElementsByClassName("cursors")[0]
        cur.style.left = x+"px";
        cur.style.top = y+"px"
    }
})

const cur = document.getElementsByClassName("cursors")[0]
cur.style.top = "50px"
cur.style.left = "50px"

window.addEventListener("error",(e)=>{console.error(e.message+"\n\tat main.js:"+e.lineno+":"+e.colno);})
let newtoweb = true;
socket.on("codeFile",(codes) =>{
   if(newtoweb){ let text = ""
    for (let i = 0; i < codes.length; i++) {
        const s= codes[i];
        if(s == "\n"||i==codes.length-1){
            if(s=="\n"&&text.length==0)continue;
            if(i==codes.length-1 && s!="\n"){     
                text = text+s
            }
            createInput(text)
            createNum()
            RunColorCode()
            text = ""
            continue;
        }
        text = text+s
    }
newtoweb =false;
}
})



socket.on("paste",(codes)=>{
    let text = ""
    for (let i = 0; i < codes.length; i++) {
        const s= codes[i];
        if(s == "\n"||i==codes.length-1){
            if(s=="\n"&&text.length==0)continue;
            if(i==codes.length-1 && s!="\n"){     
                text = text+s
            }
            createInput(text)
            createNum()
            text = ""
            continue;
        }
        text = text+s
    }
    
    RunColorCode()
})