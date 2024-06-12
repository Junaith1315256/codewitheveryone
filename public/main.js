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
    console.log(d);
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
    console.log(keys);
    if(keys == "Backspace"){
       if(CURRENT_INPUT){ if(CURRENT_INPUT.value == ""){
        removeInput()
        removeNum()}
        socket.emit("remove",CURRENT_INPUT.id,userId)
    }
    }
}


window.oninput = ()=>{
    console.log(CURRENT_INPUT.value);
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
        removeInput(currenInput);
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