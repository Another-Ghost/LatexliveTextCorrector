// ==UserScript==
// @name         Add $$
// @namespace    http://tampermonkey.net/
// @version      2024-03-14
// @description  Add `$ $` to equation
// @author       Another_Ghost
// @match        https://*.latexlive.com/*
// @icon         https://img.icons8.com/?size=50&id=1759&format=png
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
        displayAlertBox('Copied');
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

    createButton(1, convertFormulasToLaTeX);
    createButton(2, convertFormulasToLaTeX, /\\boldsymbol/g);

    function createButton(number, convert, wordsToRemove) {
        // create a new button
        let btn = document.createElement('button');
        btn.innerHTML = `Copy${number}`;
        btn.className = 'btn btn-light btn-outline-dark';
        // add click handler
        btn.onclick = function () {
            // get the selected element
            var selected = document.querySelector('#txta_input');
            // copy the text
            navigator.clipboard.writeText(convert(selected.value, wordsToRemove));
            displayAlertBox('Copied');
        };
        var CONTAINER = "#wrap_immediate > row > div.col-5.col-sm-5.col-md-5.col-lg-5.col-xl-5";
        // wait container appear and add btn
        var interval = setInterval(function () {
            var wrap = document.querySelector(CONTAINER);
            if (wrap) {
                wrap.appendChild(btn);
                clearInterval(interval);
            }
        }, 200);
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