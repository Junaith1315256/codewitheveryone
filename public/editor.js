try{


console.log("helo")
let cat  = ca
}catch(err){
const [, lineno, colno] = err.stack.match(/(\d+):(\d+)/);
console.error(err+"\n\t"+"at line:"+(parseInt(lineno)-2)+":"+colno);
}