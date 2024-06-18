function setCaretPos(div,pos = -1){
    div.innerText=div.textContent.length == 0?" ":div.textContent;
    pos = pos < 0?(div.childNodes[0].length):pos;
    div.contentEditable = "true"
    const setPos  = document.createRange();
    const set = window.getSelection()
    setPos.setStart(div.childNodes[0],pos);
    setPos.collapse(true);
    set.removeAllRanges();
    set.addRange(setPos)
    div.focus()
}
let mirror_char = true
window.addEventListener("paste",(e)=>{
    e.preventDefault();
    var codes = (e.originalEvent || e).clipboardData.getData('text/plain');
    console.log(codes);
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
console.log = (...message)=>{
    let str = ""
    for (const msg of message) {
        str = str + " "+msg
    }
    createLog(str)
}

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
    setTimeout(()=>{
        RUN.innerText = "Run"
        RUN.className = "run_unclicked"
   },1000)
    getInputs()
    socket.emit("code",inputs)
    let id = ""
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
    let count_number_of_bracket = 0;
    let changed_to_orange_due_to = ""
    let brackets_colors = [Color.blue,Color.yellow,Color.purple]
   let  multiComment  = false
    let default_color =Color.default;
    let before_comment_color = ""
    let variables = []
    let variable_created = false;
    let classes = ["Image","Date","Audio"]
    let class_created = false;
    for (let i = 0; i < INPS.length; i++) {
        let comment = false;
        if(!comment&&before_comment_color.length>0&&!multiComment){default_color=before_comment_color}
        const div =  document.createElement("div")
        colorCode.appendChild(div)
        let str = INPS[i].textContent
        let text = ""
        let keywords =[
            ["function","let","const","class","static","var"],
            ["for","if","else","break","continue","return","async"],
            ["import","export","default","from","with","try","catch","throw","finally","while","do","extends","switch","case","true","false","null","undefined","await","new","super"]
        ]
        const reg = {
            breaks : /\s|\(|\)|\{|\}|\[|\]|\'|\"|\`/,
            orange:/\'|\"|\`/,
            brackets:{
                start:/\(|\{|\[/,
                end:/\)|\}|\]/
            },
            alphaNum: /^[a-zA-Z0-9]+$/,
            num:/^[0-9]+$/
        }
        let inside_quote = false
        for (let j = 0; j < str.length; j++) {
            let s = str[j];
             for (let k = 0; k < variables.length; k++) {
                if(default_color != Color.default)break;
                let vars = variables[k]
                if(vars == (text).trim()){
                    Span(text,Color.blue,div)
                    text = ""
                    break;
                }
            } 
            for (let k = 0; k < classes.length; k++) {
                if(default_color != Color.default)break;
                let vars = classes[k]
                if(vars == (text).trim()){
                    Span(text,Color.classColor,div)
                    text = ""
                    break;
                }
            } 
            if(str[j+1]){
                if(str[j+1]=='/'&&s=='/'&&!comment &&default_color==Color.default){
                    Span(text,default_color,div)
                    text = ""
                    before_comment_color = default_color
                    default_color=Color.darkgreen;
                    comment = true
                    
                }
                if(str[j+1]=='*'&&s=='/' && !multiComment&&default_color==Color.default){
                    Span(text,default_color,div)
                    text = ""
                    before_comment_color = default_color
                    default_color=Color.darkgreen;
                    multiComment = true
                }
                if(str[j+1]=='{'&&s=='$'&&changed_to_orange_due_to=="`"){
                    Span(text,default_color,div)
                    text = ""
                    default_color=Color.default;
                    changed_to_orange_due_to=""
                    inside_quote=true
                }
                if (variable_created  && text.length > 0) {
                    
                text +=s
                    if(!reg.alphaNum.test(str[j+1])){
                        
                    variables.push(text.trim())
                    Span(text,Color.blue,div)
                    variable_created = false
                    text = ""
                    continue;
                }
                continue;
                } 
                if (class_created  && text.length > 0) {
                    
                text +=s
                    if(!reg.alphaNum.test(str[j+1])){
                        
                    classes.push(text.trim())
                    Span(text,Color.classColor,div)
                    class_created = false
                    text = ""
                    continue;
                }
                continue;
                }
            }
            if(str[j-1]){
                if (str[j-1]=="}"&&inside_quote) {
                    default_color=Color.orange;
                    changed_to_orange_due_to="`"
                    inside_quote=false
                } 
            }
            if(str[j-1]&&str[j-2]){
                if(str[j-1]=='/'&&str[j-2]=='*'&&multiComment){
                    Span(text,default_color,div)
                    text = ""
                    default_color=before_comment_color;
                    multiComment = false
                }
            }
           
           
            if(reg.breaks.test(s)){
                
                for (let k = 0; k < keywords.length; k++) {
                    if(default_color != Color.default)break
                    for (let l = 0; l < keywords[k].length; l++) {

                        const keyw = keywords[k][l];
    
                        if(text == keyw){
                            if(text=="const"){
                                variable_created=true
                            }
                            if(text=="class"){
                                class_created=true
                            }
                            Span(text,((k==0||k==2)?Color.darkblue:Color.purple),div,k==0?"italic":"normal")
                            text = ""
                            break;
                        }
                    }
                }
                if(s=="(" && default_color == Color.default){
                    Span(text,Color.yellow,div)
                }else {
                    
                    Span(text,default_color,div)
                
                }
                text = "";
               
                if(reg.orange.test(s)&&default_color == Color.default||default_color == Color.orange){
                    Span(s,Color.orange,div)
                    if(!changed_to_orange_due_to.length){
                        changed_to_orange_due_to = s
                        default_color = Color.orange
                    }else if (changed_to_orange_due_to == s) {
                        changed_to_orange_due_to = ""
                        default_color = Color.default
                    }
                    
                    continue;
                }
                if(default_color == Color.default){
                    if (reg.brackets.start.test(s)||reg.brackets.end.test(s)) {
                       
                        if(reg.brackets.start.test(s)){
                            Span(s,brackets_colors[count_number_of_bracket%brackets_colors.length],div)
                            count_number_of_bracket++
                        }else  if(reg.brackets.end.test(s)&&count_number_of_bracket<=0){
                            Span(s,Color.darkred,div);
                            mirror_char = false;
                            div.style.backgroundColor = "#331111"
                        }else if(reg.brackets.end.test(s)){
                            Span(s,brackets_colors[(count_number_of_bracket-1)%brackets_colors.length],div)
                            mirror_char = true;
                            count_number_of_bracket--
                        }
                        continue;
                    }
                }
                
                Span(s,default_color,div)
                continue;
            }
            
            if(s=="." &&  default_color == Color.default){
                Span(text+s,Color.blue,div)
                text = "";
                continue;
            }else if(!reg.alphaNum.test(s) && default_color == Color.default&&s!="_"){
                Span(text,Color.default,div)
                text =""
                Span(s,Color.white,div)
                continue;
            }else if(reg.num.test(s)&& default_color == Color.default&&text.length==0){
                Span(s,Color.green,div)
                continue;
            }
            text+=s
        }
       Span(text,default_color,div)
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

window.onkeydown = (e)=>{
    CURRENT_INPUT = document.activeElement;
    let keys = e.key
    if(keys == "Enter"){
        socket.emit("add",CURRENT_INPUT.id,window.getSelection().focusOffset)
        CURRENT_INPUT.contentEditable = "false"

    }
    if(keys == "Backspace"&&window.getSelection().focusOffset == 0){
       if(CURRENT_INPUT){ 
        socket.emit("remove",CURRENT_INPUT.id,0)
        }
    }

   if(mirror_char){ let mirros = ["(",")","{","}","[","]","'","'",'"','"',"`","`",]
    for (let i = 0; i < mirros.length; i+=2) {
        if (keys == mirros[i] ) {
            let pos =  window.getSelection().focusOffset;
            let str = CURRENT_INPUT.textContent
            CURRENT_INPUT.innerText = str.slice(0,pos)+mirros[i+1]+str.slice(pos)
            setCaretPos(CURRENT_INPUT,pos);
            break;
        }
        
    }}
  
    

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
    darkgreen: "#007542",
    darkred:"#dd0000",
    classColor:"#11ffaa"
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