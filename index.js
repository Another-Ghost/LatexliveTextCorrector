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


/**
 * 将字符串中的公式转换为LaTeX格式，用"$$"包围起来。
 */
function convertFormulasToLaTeX(inStr, wordsToRemove = '') {
    //let str1 = "3) 求序列  R_{4}(n)  的  Z  变换:\n\n\\boldsymbol{X}(\\mathbf{z})=\\sum_{\\boldsymbol{n}=-\\infty}^{\\infty} \\boldsymbol{x}(\\boldsymbol{n}) z^{-n}=\\sum_{\\boldsymbol{n}\n";

    inStr = inStr.replace(wordsToRemove, '');
    inStr = inStr.replace(/ +/g, ' '); //将多个空格替换为一个空格
    inStr = inStr.replace(/\n+/g, '\n'); //去除重复换行符
    let str = inStr.trim(); //删除字符串两端的空白字符
    //console.log(inStr);
    let outStr = "";
    let equation = "";
    let bEquation = false;
    let lastCharPos = 0;

    let PushEquationToOutStr = () => {
        if(/[\-<=>\\\^_{\|}]/.test(equation)){
            outStr += ToLatex(equation, lastCharPos);
        }
        else
        {
            outStr+=equation;
        }
        bEquation = false;
        equation = "";
        lastCharPos = 0;
    }

    for(let i = 0; i < str.length; i++) {
        let c = str[i];
        if(!bEquation)
        {
            if(c.match(/[!-~]/)) { //判断是否是非空格ASCII字符
                if(!bEquation) {
                    if(!c.match(/[:,.]/)) //把开头的 ":" 排除在 $$ 外；因为之后一般会跟着换行符，所以没有写在 ToLatex 函数里
                    {
                        bEquation = true;
                        equation += c;
                        lastCharPos = equation.length; //记录最后一个字符的位置的后一个位置
                    }
                    else
                    {
                        outStr += c;
                    }
                }
            } 
            else
            {
                outStr += c;
            }
        }
        else
        {
            equation += c;
            lastCharPos = equation.length; //记录最后一个字符的位置的后一个位置
            if(c.match(/[\n\r]/))
            {
                PushEquationToOutStr();
            }
            else if (c.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/)) { //判断是否是中文字符
                if (bEquation) {
                    PushEquationToOutStr();
                }
                outStr += c;
            }
        }
    }
    if(equation.length > 0) {
        PushEquationToOutStr();
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

    function ToLatex(equation, lastCharPos)
    {
        if(equation[equation.length-1] != '$')
        {
            equation = insertCharAt(equation, "$$", lastCharPos); //在公式字符串的最后一个非空格字符的位置的后一个位置插入"$$")
        }
        if(equation[0] != '$')
        {
            equation = "$$" + equation;
        }
        return equation;
    }
}