const socket = io();
let userId = Math.floor(Math.random()*100000000)
let CURRENT_INPUT = 0;
const INPS = document.getElementsByClassName("lines")
let inputs = "" 
function getInputs(){
    inputs = ""
    for (let i = 0; i < INPS.length; i++) {
        const line = INPS[i];
        inputs = inputs+"\n"+line.value
    }
}
const Log_Container = document.getElementById("runner_container")
const createLog = (msg,type = "")=>{
    const LOGS = document.createElement("div")
    LOGS.className = `logs ${type}`
    LOGS.textContent = msg
    Log_Container.appendChild(LOGS)
}

const RUN =  document.getElementById("run");
const RunTheProgram = ()=>{
    const logs = document.getElementsByClassName("logs")
    for (let i = 0; i < logs.length; i++) {
        const e = logs[i];
        Log_Container.removeChild(e)
        i--;
    }
    getInputs()
    socket.emit("code",inputs)
    var body= document.getElementsByTagName('body')[0];
    body.removeChild(document.getElementById("script"))
    setTimeout(()=>{
        var script= document.createElement('script');
        script.type= 'text/javascript';
        script.src= 'editor.js';
        script.id = "script"
        body.appendChild(script)
    },1000)
}
RUN.addEventListener("click",()=>{
    socket.emit("run")
})

 console.log = (message)=>{
    createLog(message)
}

console.warn = (message)=>{
    createLog(message,"warn")
}
console.error = (message)=>{
    createLog(message,"error")
} 
const createInput = ()=>{
    const texts = document.getElementById("texts")
    const Input =  document.createElement("input")
    Input.type = "text"
    Input.className = "lines"
    Input.id = `line${INPS.length}`
    Input.spellcheck = false;
    Input.autocomplete = "off"
    //Input.id = `line${num}`
    Input.addEventListener("click",(e)=>{
        const l = e.currentTarget
        CURRENT_INPUT = l
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
    INPS[d-1].focus()
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
        socket.emit("add",CURRENT_INPUT.id,userId)
        createInput()
        if(CURRENT_INPUT != INPS[INPS.length -2]){
        for (let i = INPS.length; i >= 0; i--) {
            if(CURRENT_INPUT == INPS[i-1])break;
           if(INPS[i] && INPS[i-1]){
            INPS[i].value = INPS[i-1].value
            INPS[i-1].value = ""
            INPS[i-1].focus()
            }
            
        }}else{
            INPS[INPS.length -1].focus()
        }
        
        
        createNum()
    }
    if(keys == "Backspace"){
       if(CURRENT_INPUT){ if(CURRENT_INPUT.value == ""){
        removeInput()
        removeNum()
        socket.emit("remove",CURRENT_INPUT.id,userId)
    }
    }
    }
}


window.oninput = ()=>{
    socket.emit("edit",CURRENT_INPUT.id,CURRENT_INPUT.value,userId)
}

socket.on("edit",(id,code,uid)=>{
    if(uid != userId){
const line =  document.getElementById(id);
line.value = code;}
})

socket.on("remove",(id,uid)=>{
    if(uid != userId){
        const currenInput=document.getElementById(id)
        removeInput();
        removeNum()
    }
})

socket.on("add",(id,uid)=>{
    const currenInput=document.getElementById(id)
    if(uid != userId){
        createInput()
        createNum()
        if(currenInput != INPS[INPS.length -2]){
            for (let i = INPS.length; i >= 0; i--) {
                if(currenInput == INPS[i-1])break;
               if(INPS[i] && INPS[i-1]){
                INPS[i].value = INPS[i-1].value
                INPS[i-1].value = ""
                INPS[i-1].focus()
                }
                
            }}else{
                INPS[INPS.length -1].focus()
            }
            
            
    }
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
function Span(msg,color,div){
    const span = document.createElement("span")
    span.innerText = msg;
    span.style.color = color;
    div.appendChild(span)
}
window.oninput = ()=>{
    colorCode.innerHTML = ""
    
    let bigComment = false
    for (let i = 0; i < INPS.length; i++) {
        const div =  document.createElement("div")
        let keyword = ["for","if","else","while","import"] 
        let keyword1 = ["const","function","class","let","new"]
        let keyword2 = ["=",">","<","-","+","*","/",";",",",":"]
        let keyword3 = [1,2,3,4,5,6,7,8,9,0]
        let str =  INPS[i].value
        let text = ""
        let comment = false
        let dcolor = bigComment?Color.darkgreen: Color.default
        colorCode.appendChild(div)
        let strstart = false
        for (let j = 0; j < str.length; j++) {
            const s = str[j];
            if(text.includes("$")&&text.includes("{")&&s=="}"){
                strstart == true;
                text=text+s
                Span(text.replace("\xa0"),dcolor,div)
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
                
                if(s == " "){
                    Span(text,dcolor,div)
                    Span("\xa0",Color.default,div)
                    text = ""
                }else{
                   text = text+s
                }
                continue
            }
            if (s == '"'||s=="'" || s == '`'||strstart) {
                strstart = true
                text = text+s
            }
            if(str[j+1]&&str[j+2]){
                if(str[j+1]=="$" && str[j+2]=="{"){
                    Span(text.replace(" ","\xa0"), Color.orange,div)
                    strstart = false
                    text = ""
                    continue;
                }
            }
            if((text.includes('"')&&text.includes('"',1))||((text.includes('}')||(text.includes('`'))&&text.includes('`',1)))||(text.includes("'")&&text.includes("'",1))){
                Span(text.replace(" ","\xa0"), Color.orange,div)
                strstart = false
                text = ""
                continue;
            }
            if(strstart)continue
            
            
            if((s == " "||s=="(")&& text.length > 0){
                let cond  = false
                
                for (let k = 0; k < keyword.length; k++) {
                    const ke = keyword[k];
                    if(text == ke){
                        cond = true
                        Span(text,Color.purple,div)
                        if(s==" "){
                            Span("\xa0",Color.purple,div)
                        }
                        text = ""
                        break;
                    }
                }
                for (let k = 0; k < keyword1.length; k++) {
                    const ke = keyword1[k];
                    if(text == ke){
                        cond = true
                        Span(text,Color.darkblue,div)
                        Span("\xa0",Color.default,div)
                        text = ""
                        break;
                    }
                }
                if(s == "(" && cond){
                    Span(s,Color.purple,div)
                }
                if(s == "(" && text.length > 0){
                    text = text+s
                    Span(text, Color.yellow,div)
                    text = ""
                    continue
                }
                if (!cond) {
                 Span(text,Color.default,div)
                    text = ""
                }
                if(cond)continue
            }
            
            if(s == " "){
                Span(text,Color.default,div)
                Span("\xa0",Color.default,div)
                text = ""
                continue;
            }
           
            let cond1  = false
            for (let k = 0; k < keyword2.length; k++) {
                const ke = keyword2[k];
                if(s== ke){
                    cond1 = true
                    
                    Span(text,Color.default,div)
                    Span(s,Color.white,div)
                    text = ""
                    break;
                }
            }
            for (let k = 0; k < keyword3.length; k++) {
                const ke = keyword3[k];
                if(s== ke){
                    cond1 = true
                    
                    Span(text,Color.default,div)
                    Span(s,(text?Color.default:Color.green),div)
                    text = ""
                    break;
                }
            }
            if(cond1)continue
            
            if(s == "." && text.length > 0){
                text = text+s
                Span(text, Color.blue,div)
                text = ""
                continue
            }
            
           
            
            if(s==")" && text.length > 0){
                Span(text,Color.default,div)
                text = ""
                Span(s, Color.yellow,div)
                continue
            }else if(s==")"){
                Span(s, Color.yellow,div)
                continue;
            }
            
            text = text+s

        }
        Span(text.replace("\xa0"),dcolor,div)
    }
}