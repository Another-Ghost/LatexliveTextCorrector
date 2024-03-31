// ==UserScript==
// @name         Latexlive公式编辑器 为公式添加 $$ 符号，并修复常见的图片识别结果中的错误
// @namespace    http://tampermonkey.net/
// @version      2024-03-30.3
// @description  为中文文本中的公式添加 $$ 符号，以适应 Markdown 或 Latex 格式的需求。并修复常见的图片识别结果中的错误。目前还无法处理英文文本中的公式。
// @author       Another_Ghost
// @match        https://*.latexlive.com/*
// @icon         https://img.icons8.com/?size=50&id=1759&format=png
// @grant        none
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/491217/Latexlive%E5%85%AC%E5%BC%8F%E7%BC%96%E8%BE%91%E5%99%A8%20%E4%B8%BA%E5%85%AC%E5%BC%8F%E6%B7%BB%E5%8A%A0%20%24%24%20%E7%AC%A6%E5%8F%B7%EF%BC%8C%E5%B9%B6%E4%BF%AE%E5%A4%8D%E5%B8%B8%E8%A7%81%E7%9A%84%E5%9B%BE%E7%89%87%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%E4%B8%AD%E7%9A%84%E9%94%99%E8%AF%AF.user.js
// @updateURL https://update.greasyfork.org/scripts/491217/Latexlive%E5%85%AC%E5%BC%8F%E7%BC%96%E8%BE%91%E5%99%A8%20%E4%B8%BA%E5%85%AC%E5%BC%8F%E6%B7%BB%E5%8A%A0%20%24%24%20%E7%AC%A6%E5%8F%B7%EF%BC%8C%E5%B9%B6%E4%BF%AE%E5%A4%8D%E5%B8%B8%E8%A7%81%E7%9A%84%E5%9B%BE%E7%89%87%E8%AF%86%E5%88%AB%E7%BB%93%E6%9E%9C%E4%B8%AD%E7%9A%84%E9%94%99%E8%AF%AF.meta.js
// ==/UserScript==


(function () {
    createButton('复制', copyOriginalText, '');
    createButton('转换后复制', convertFormulasToLaTeX, /\\boldsymbol/g);

    /**
     * 创建按钮并添加到指定容器中
     * @param {number} buttonName - 按钮的名字
     * @param {function} convert - 转换函数
     * @param {string} wordsToRemove - 需要移除的字符串
     */
    function createButton(buttonName, convert, wordsToRemove) {
        // 创建一个新按钮
        let button = document.createElement('button');
        button.innerHTML = `${buttonName}`;
        button.className = 'btn btn-light btn-outline-dark';
        //button.id = `copy-btn${buttonId}`;
        // add click handler
        button.onclick = function () {
            //选中输入文本框的所有文本
            var selected = document.querySelector('#txta_input'); 
            //先通过 convert 函数转换文本，再复制
            navigator.clipboard.writeText(convert(selected.value, wordsToRemove));
            displayAlertBox('已复制');
        };
        //输入框上方的容器
        var CONTAINER = "#wrap_immediate > row > div.col-5.col-sm-5.col-md-5.col-lg-5.col-xl-5";
        //等待容器出现并添加按钮
        var interval = setInterval(function () {
            var wrap = document.querySelector(CONTAINER);
            if (wrap) {
                wrap.appendChild(button);
                clearInterval(interval);
            }
        }, 200);
    }

    function copyOriginalText(inStr, wordsToRemove = '') {
        navigator.clipboard.writeText(inStr);
    }

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
        }
        for(let i = 0; i < str.length; i++) {
            let c = str[i];
            if(c.match(/[!-~]/)) { //判断是否是非空格ASCII字符
                if(!bEquation) {
                    if(c !== ':') //把开头的 ":" 排除在 $$ 外；因为之后一般会跟着换行符，所以没有写在 ToLatex 函数里
                    {
                        bEquation = true;
                    }
                    else
                    {
                        outStr += c;
                    }
                }
                if(bEquation)
                {
                    equation += c;
                    lastCharPos = equation.length; //记录最后一个字符的位置的后一个位置
                }
            } else if (c.match(/\s/)) { //判断是否是空白字符
                if (bEquation) {
                    equation += c; //因为公式中可能有空格字符，所以先把空格字符加入公式字符串
                } else {
                    outStr += c;
                }
            } else if (c.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/)) { //判断是否是中文字符
                if (bEquation) {
                    PushEquationToOutStr();
                    bEquation = false;
                    equation = "";
                    lastCharPos = 0;
                }
                outStr += c;
            }
        }
        if(equation.length > 0) {
            PushEquationToOutStr();
        }
        console.log(outStr);
        return outStr;
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

    function displayAlertBox(text) {
        var alertBox = document.createElement('div');
        alertBox.innerHTML = text;
        //alertBox.style.display = none;
        alertBox.style.position = 'fixed';
        alertBox.style.bottom = `20px`;
        alertBox.style.left = `50%`;
        alertBox.style.transform = `translateX(-50%)`;
        alertBox.style.backgroundColor = `#4CAF50`;
        alertBox.style.color = `white`;
        alertBox.style.padding = `12px`;
        alertBox.style.borderRadius = `5px`;
        alertBox.style.zIndex = `1000`;
        alertBox.style.boxShadow = `0px 0px 10px rgba(0,0,0,0.5)`;
        alertBox.style.opacity = '0';
        alertBox.style.transition = 'opacity 0.3s';
        document.body.appendChild(alertBox);
        setTimeout(function () {
            alertBox.style.opacity = '1';
        }, 100);
        setTimeout(function () {
            alertBox.style.opacity = '0';
        }, 1100);
        setTimeout(function () {
            alertBox.remove();
        }, 1500);
    }
})();