document.getElementById('button').addEventListener('click', function(){
let text_input = document.getElementById('text1');
let text_output = document.getElementById('text2');
text_output.value = convertFormulasToLaTeX(text_input.value, /\\boldsymbol/g);
//console.log(text_input);
// let text_output = document.getElementById('text2');
// document.getElementById('text1').value = "3) 求序列  R_{4}(n)  的  Z  变换";
// //let regex = /([\u4e00-\u9fff]+)|([^\u4e00-\u9fff]+)/;
// let regex = /[!-~][!-~]*[!-~]/gu;
// let result = text_input.value.split(regex);
// console.log(result);
// //text_output.value = text_input.value.split(regex);
// text_input.textContent;

// let str = "Hello, 世界! 123";
// let matches = str.match(/[!-~][!-~]*[!-~]/g);
// console.log(matches);
});

let bRadical = true;
/**
 * 将字符串中的公式转换为LaTeX格式，用"$$"包围起来。
 */
function convertFormulasToLaTeX(inStr, wordsToRemove = '') {
    //let str1 = "3) 求序列  R_{4}(n)  的  Z  变换:\n\n\\boldsymbol{X}(\\mathbf{z})=\\sum_{\\boldsymbol{n}=-\\infty}^{\\infty} \\boldsymbol{x}(\\boldsymbol{n}) z^{-n}=\\sum_{\\boldsymbol{n}\n";
    inStr = inStr.trim(); //删除字符串两端的空白字符
    if(bRadical)
    {
        inStr = inStr.replace(/\\begin{array}{[^{}]*}/g, '\\begin{aligned}');
        inStr = inStr.replace(/\\end{array}/g, '\\end{aligned}');
    }
    inStr = inStr.replace(wordsToRemove, '');
    inStr = inStr.replace(/ +/g, ' '); //将多个空格替换为一个空格
    inStr = inStr.replace(/\n+/g, '\n'); //去除重复换行符
    inStr = inStr.replace('输人', '输入'); 
    let str = inStr.trim(); 
    //console.log(inStr);
    let outStr = "";
    let equation = "";
    let bEquation = false;

    //处理并存储已确定的一个公式
    let PushEquationToOutStr = (nextChar) => {
        if(/[\-<=>\\\^_{\|}\/\*\+\(]/.test(equation) || /^[a-zA-Z0-9]$/.test(equation.trim())){
            outStr += ToMarkdown(equation, nextChar);
        }
        else
        {
            outStr+=equation;
        }
        bEquation = false;
        equation = "";
    }

    function ToMarkdown(equation, nextChar)
    {
        equationSymbol = "$";
        let prevChar = outStr[outStr.length-1];
        if((!nextChar || nextChar.match(/[\n\r]/)) && (!prevChar || prevChar.match(/[\n\r]/)))
        {
            equationSymbol = "$$";
        }
        if(equation[equation.length-1] != '$' || equation[0] != '$$')
        {
            equation = insertCharAt(equation, equationSymbol, findLastNonWhitespaceChar(equation)+1); //在公式字符串的最后一个非空格字符的位置的后一个位置插入"$$")
        }
        if(equation[0] != '$' || equation[0] != '$$')
        {
            equation = equationSymbol + equation;
        }
        return equation;
    }
    for(let i = 0; i < str.length; i++) {
        let c = str[i];
        //let nextChar = i < str.length - 1 ? str[i + 1] : '';
        if(!bEquation){
            if(c.match(/[!-~]/)) { //判断是否是非空格ASCII字符
                if(!bEquation && !c.match(/[:,.]/)) //把开头的 ":" 排除在 $$ 外；因为之后一般会跟着换行符，所以没有写在 ToLatex 函数里
                {
                    bEquation = true;
                } 
            }
        }
        else{
            if((c.match(/[\n\r]/) && (!/\\begin/.test(equation) || /\\end/.test(equation))) || (!c.match(/[ -~]/) && !c.match(/[\n\r]/)))
            {
                PushEquationToOutStr(c);
            }
        }

        if(bEquation){
            equation += c;
        }
        else{
            outStr += c;
        }
    }
    if(equation.length > 0) {
        PushEquationToOutStr('');
    }
    console.log(outStr);
    return outStr;

    /**
     * Insert a character at a specified index in the original string.
     * @param {string} originalString - The original string.
     * @param {string} charToInsert - The character to insert.
     * @param {number} index - The index to insert at.
     * @returns {string} - The new string with the inserted character.
     */
    function insertCharAt(originalString, charToInsert, index) {
        let firstPart = originalString.slice(0, index);
        let secondPart = originalString.slice(index);
        return `${firstPart}${charToInsert}${secondPart}`;
    }

    function findLastNonWhitespaceChar(str) {
        const match = str.match(/(\S)\s*$/);
        return match ? str.lastIndexOf(match[1]) : -1;
    }
    
}
