// ==UserScript==
// @name         Add $$
// @namespace    http://tampermonkey.net/
// @version      2024-03-14
// @description  Add `$ $` to symbols
// @author       Another_Ghost
// @match        https://*.latexlive.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    // create a new button
    var btn = document.createElement('button');
    btn.innerHTML = '复制';
    // add class to btn
    btn.className = 'btn btn-light theme-fill';
    // set id
    btn.id = 'copy-btn';
    // add click handler
    btn.onclick = function () {
        // get the selected element
        var selected = document.querySelector('#txta_input');
        // copy the text
        navigator.clipboard.writeText(convertFormulasToLaTeX(selected.value));
        toast('复制成功');
    };
    var CONTAINER = "#wrap_immediate > row > div.col-5.col-sm-5.col-md-5.col-lg-5.col-xl-5";
    // wait container appear and add btn
    var interval = setInterval(function () {
        var wrap = document.querySelector(CONTAINER);
        if (wrap) {
            wrap.appendChild(btn);
            clearInterval(interval);
        }


    }, 100);

/**
 * 将字符串中的公式转换为LaTeX格式，用"$$"包围起来。
 */
function convertFormulasToLaTeX(inStr) {
    //let str1 = "3) 求序列  R_{4}(n)  的  Z  变换:\n\n\\boldsymbol{X}(\\mathbf{z})=\\sum_{\\boldsymbol{n}=-\\infty}^{\\infty} \\boldsymbol{x}(\\boldsymbol{n}) z^{-n}=\\sum_{\\boldsymbol{n}\n";
    inStr = inStr.replace(/ +/g, ' '); //将多个空格替换为一个空格
    inStr = inStr.replace(/\n+/g, '\n'); //去除重复换行符
    let str = inStr.trim(); //删除字符串两端的空白字符
    //console.log(inStr);
    let outStr = "";
    let equation = "";
    let bEquation = false;
    let lastCharPos = 0;
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
        } else if (c.match(/[\u4e00-\u9fff]/)) { //判断是否是中文字符
            if (bEquation) {
                if(/[\(\-<=>\\\^_{\|}]/.test(equation)){
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
            outStr += c;
        }
    }
    if(equation.length > 0) {
        outStr += ToLatex(equation, lastCharPos);
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

    function toast(msg) {
        var toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = msg;
        toast.style.position = 'fixed';
        toast.style.bottom = '10px';
        toast.style.right = '10px';
        toast.style.zIndex = '9999';
        toast.style.backgroundColor = '#fff';
        toast.style.color = '#000';
        toast.style.padding = '10px';
        toast.style.borderRadius = '5px';
        toast.style.boxShadow = '0 0 5px #000';
        toast.style.fontSize = '16px';
        toast.style.fontWeight = 'bold';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s';
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '1';
        }, 100);
        setTimeout(function () {
            toast.style.opacity = '0';
        }, 2000);
        setTimeout(function () {
            toast.remove();
        }, 3000);
    }
})();