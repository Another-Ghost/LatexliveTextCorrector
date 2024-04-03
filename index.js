document.getElementById('button').addEventListener('click', function(){
let text_input = document.getElementById('text1');
let text_output = document.getElementById('text2');
text_output.value = convertFormulasToLaTeX(text_input.value, /\\boldsymbol/g);
});

let bRadical = false; //是否是更激进的转换方式
/**
 * 将字符串中的公式转换为LaTeX格式，用"$$"包围起来。
 */
function convertFormulasToLaTeX(inStr, wordsToRemove = '') {
    
    // 输入的预处理
    inStr = inStr.trim(); //删除字符串两端的空白字符
    if(bRadical)
    {
        inStr = inStr.replace(/\\begin{array}{[^{}]*}/g, '\\begin{aligned}');
        inStr = inStr.replace(/\\end{array}/g, '\\end{aligned}');
    }
    inStr = inStr.replace(wordsToRemove, '');
    inStr = inStr.replace(/ +/g, ' '); //将多个空格替换为一个空格
    inStr = inStr.replace(/\n+/g, '\n'); //去除重复换行符
    inStr = inStr.replace(/输人/g, "输入");
    inStr = inStr.replace(/存人/g, "存入");
    inStr = inStr.trim(); 

    
    BeginEndRegex = /\\begin\{(.*?)\}(.*?)\\end\{\1\}/;
    ChineseRegex = /[\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+/g;
    wordRegex = /\b[a-zA-Z]{2,}\b/g; ///\b[a-zA-Z]{2,}\b/g

    let temp = inStr.match(/\\begin{(.*?)}([\s\S]*?)\\end{\1}/);

    let outStr = ""; //最终输出的字符串
    let blocks = inStr.trim().split(/(\\begin{(.*?)}([\s\S]*?)\\end{\2})|[\n\r]/g); //.map(x => x.trim()).filter(x => x.trim() != "");

    for(let i = 0; i < blocks.length; i++){
        if(!blocks[i].match(BeginEndRegex)){
            let parts = blocks[i].split(/(?<!\/\\text ?{[^{}]*})([\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+)+\b[a-zA-Z]{2,}\b/);
            if(parts.length>1){
                blocks[i] = "";
                for(let j = 0; j < parts.length; j++){
                    if(!parts[j].match(ChineseRegex) && !parts[j].match(wordRegex)){
                        parts[j] = AddToStartEnd(parts[j], "$");
                    }
                    blocks[i] += parts[j];
                }
            }
            else
            {
                blocks[i] = AddToStartEnd(blocks[i], "$$");
            }
        }
        outStr += blocks[i];
    }

    return outStr;

    function AddToStartEnd(str, toAdd){
        return toAdd+str+toAdd;
    }
}
