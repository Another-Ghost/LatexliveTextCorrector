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
    //inStr = inStr.replace(/\\text *{([^{}]*)}/g, '$1');
    let str = inStr.trim(); 

    let outStr = ""; //最终输出的字符串
    let equation = ""; //存储一个公式
    let bEquation = false; //是否在处理一个公式

    let closingPunctuations = /[:,.]/; //结尾的标点符号


    //遍历字符串的主循环
    for(let i = 0; i < str.length; i++) {
        let c = str[i];
        //let nextChar = i < str.length - 1 ? str[i + 1] : '';
        if(!bEquation){
            if(c.match(/[!-~]/)) { //判断是否是非空格ASCII字符
                if(!bEquation && !c.match(closingPunctuations)) //把公式开头前的（上一句结尾的）标点符号排除在 $$ 外
                {
                    bEquation = true;
                } 
            }
        }
        else{ //判断一个公式是否结束
            if((c.match(/[\n\r]/) && (!/\\begin/.test(equation) || /\\end/.test(equation))) //换行符且是不是在\begin{array}和\end{array}之间，则算作一个待定公式
            || (!c.match(/[ -~]/) && !(/\\text *{([^}])*$/.test(equation)) && !c.match(/[\n\r]/)) //判断如果是非换行符的ASCII字符，且不在 \text{} 中，则算作一个待定公式进行后续处理
            )
            {
                PushEquationToOutStr(c);
            }
        }

        //循环中，只有此处存储字符
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


    //处理并存储一个待定公式
    function PushEquationToOutStr(nextChar) {
        equation = equation.trim();
        let prevChar = outStr[outStr.length-1];
        // if(!((!nextChar || nextChar.match(/[\n\r]/)) && (!prevChar || prevChar.match(/[\n\r]/)))) //判断是否非单行居中显示的公式
        // {
        //     equations = str.split(/,/g)
        //     .map(part => part.trim()) // 去除每个部分的空格
        //     .filter(part => part !== ''); // 过滤空部分
        // }
        
        if(equation[equation.length-1].match(closingPunctuations))  //因为只能待定公式确定后才能知道末尾的字符是否是标点，因为公式中也可能有标点，所以不能放在之前的步骤判断
        {
            closingPunctuation = equation[equation.length-1];
            equation = equation.slice(0, -1); //去掉结尾的标点符号
            equation = equation.trim();
        }
        if(/[\-<=>\\\^_{\|}\/\*\+\(]/.test(equation) ||
         /^(?=.*[A-Za-z])(?=.*\d).+$/.test(equation) //^[a-zA-Z0-9]$/.test(equation)){ //判断是否是真的公式
        ){
            outStr += ToMarkdownLatex(equation, nextChar);
            if(closingPunctuation != "")
            {
                outStr += closingPunctuation + ' '; // 加上结尾的标点符号
            }
        }
        else
        {
            outStr+=equation;
        }
        bEquation = false;
        equation = "";
        closingPunctuation = "";
    }

    //实际转换格式的函数
    function ToMarkdownLatex(equation, nextChar)
    {
        equationSymbol = "$";
        let prevChar = outStr[outStr.length-1];
        if((!nextChar || nextChar.match(/[\n\r]/)) && (!prevChar || prevChar.match(/[\n\r]/))) //判断是否为单行居中显示的公式
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
        if(prevChar && !prevChar.match(/\s/))   //判断是否需要在公式前加空格，统一格式
        {
            equation = ' ' + equation;
        }
        if(nextChar && !nextChar.match(/\s/))
        {
            equation = equation + ' ';
        }
        return equation;
    }

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

    function SplitByLine(str)
    {
        let strArray_1 = str.split(/[\n\r]/g);
        let i = 0;
        let strArray_2 = [];
        while(i < strArray.length)
        {
            if(strArray[i].match(/\\begin/))
            {
                let j = i + 1;
                while(j < strArray.length && !strArray[j].match(/\\end/))
                {
                    j++;
                }
                strArray_2.push(strArray.slice(i, j+1).join('\n'));
                i = j + 1;
            }
            else
            {
                strArray_2.push(strArray[i]);
                i++;
            }
        }
    }
}
