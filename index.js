document.getElementById('button').addEventListener('click', function(){
let text_input = document.getElementById('text1');
let text_output = document.getElementById('text2');
text_output.value = convertFormulasToLaTeX(text_input.value, /\\boldsymbol/g);
});

let bRadical = true; //是否是更激进的转换方式
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
    //inStr = inStr.trim(); 
    
    let outStr = ""; //最终输出的字符串

    let blocks = SplitToBlocks(inStr);

    for(let i = 0; i < blocks.length; i++){
        if(!blocks[i].match(/\\begin\{(.*?)\}([\s\S]*?)\\end\{\1\}/)){ //判断是否多行非全公式块，是则不需做任何处理

            let tempMap = {};
            let index = 0;
        
            // 替换 $\text{...}$ 结构
            let processedBlock = blocks[i].replace(/\$\\text ?\{[^{}]*\}\$/g, match => {
                let placeholder = `__PLACEHOLDER${index++}__`;
                tempMap[placeholder] = match;
                return placeholder;
            });
        
            let parts = processedBlock.split(/([\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+)|( +[a-zA-Z]{2,} +)/).filter(part => part !== undefined);
            if(parts.length > 1){
                blocks[i] = blocks[i].replace(/\\text ?\{([^{}]*)\}/g, '$1'); //非全公式块，去掉\text{}
                //非公式行，替换中文句尾标点
                blocks[i] = blocks[i].replace(/, *?/g, '，');
                blocks[i] = blocks[i].replace(/: *?/g, '：');
                blocks[i] = blocks[i].replace(/([\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]) +([\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef])/g, '$1$2');

                // 在非中文和非单词字符串前后加上$
                blocks[i] = blocks[i].replace(/[^\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+/g, match => {
                    if(match.trim() === '') {
                        return match;
                    }
                    else if(match.match(/ +[a-zA-Z]{2,} */) || match.match(/^[a-zA-Z]{2,} */)) { // match.match(/^[a-zA-Z]{2,} */) 为匹配 word 开头的情况
                        return match;
                    }
                    else{
                        return ` $` + match.trim() + '$ ';
                    }
                });

                // 把英文单词前后的$去掉
                //blocks[i] = blocks[i].replace(/\$([a-zA-Z]{2,})\$/g, '$1');
                
                // let tempWordMap = {};
                // let unicodeStart = 0x1000;
                // let replaceFunc = (match) => {
                //     // 将当前 Unicode 值转换为字符串
                //     let placeholder = String.fromCharCode(unicodeStart);
                //     // 递增 Unicode 值以便下一个替换
                //     tempWordMap[unicodeStart++] = match;
                //     return placeholder;
                // };
                // let replacedBlock = blocks[i].replace(/(?<=[\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef ])[a-zA-Z]{2,}(?=[\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef ])/g, replaceFunc);
                // replacedBlock = replacedBlock.replace(/[\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+/g, replaceFunc);
                // //replacedBlock = replacedBlock.replace(/ +/, '');
                // replacedBlock = replacedBlock.replace(/[^\u1000-\u2fff]+/g, match => {
                //     if(match.trim() === '') {
                //         return match;
                //     }
                //     else{
                //         return ` $` + match.trim() + '$ ';
                //     }
                // });
                // // 将替换后的字符串还原
                // blocks[i] = replacedBlock.replace(/[\u1000-\u2fff]/g, placeholder => tempWordMap[placeholder.charCodeAt(0)]);
            
            }
            else { //单行全公式块，只需整体前后加上$$
                blocks[i] = AddToStartEnd(blocks[i], "$$"); 
            }
            
        }else{ //多行全公式块，只需整体前后加上$$
            blocks[i] = AddToStartEnd(blocks[i], "$$");
        }

        outStr += blocks[i]+'\n';
    }

    return outStr;

    function AddToStartEnd(str, toAdd){
        return toAdd+str.trim()+toAdd;
    }

    // 将字符串分割为块
    function SplitToBlocks(str)
    {
        //先按换行分割
        let splits = str.split(/[\n\r]/g).filter(part => part !== undefined); 
        let i = 0;
        let blocks = [];
        while(i < splits.length)
        {
            //将\begin{x} ... \end{x} 视为一个块，所以需要合并行
            if(splits[i].match(/\\begin/))
            {
                let j = i + 1;
                while(j < splits.length && !splits[j].match(/\\end/))
                {
                    j++;
                }
                let tempStr = "";
                for(let k = i; k < j + 1; k++)
                {
                    tempStr += splits[k] + "\n";
                }
                blocks.push(tempStr);
                i = j + 1;
            }
            else
            {
                blocks.push(splits[i]);
                i++;
            }
        }
        return blocks;
    }

}
