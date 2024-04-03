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
        inStr = inStr.replace(wordsToRemove, '');
    }
    inStr = inStr.replace(/ */g, ' '); //将多个空格替换为一个空格
    inStr = inStr.replace(/\n+/g, '\n'); //去除重复换行符
    inStr = inStr.replace(/输人/g, "输入");
    inStr = inStr.replace(/存人/g, "存入");
    //inStr = inStr.trim(); 
    
    //BeginEndRegex = /\\begin\{(.*?)\}(.*?)\\end\{\1\}/;
    //ChineseRegex = /[\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+/g;
    //wordRegex = /\b[a-zA-Z]{2,}\b/g; ///\b[a-zA-Z]{2,}\b/g

    let outStr = ""; //最终输出的字符串

    let blocks = SplitToBlocks(inStr);

    for(let i = 0; i < blocks.length; i++){
        if(!blocks[i].match(/\\begin\{(.*?)\}(.*?)\\end\{\1\}/)){ //判断是否多行非全公式块，是则不需做任何处理

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
                block[i] = blocks[i].replace(/\\text ?\{([^{}]*)\}/g, '$1'); //非全公式块，去掉\text{}
                //非公式行，替换中文句尾标点
                block[i] = block[i].replace(/, +?/g, '，');
                block[i] = block[i].replace(/: +?/g, '：');

                // 在非中文字符串前后加上$
                block[i] = block[i].replace(/[^\u4E00-\u9FA5\u3000-\u303F\uff00-\uffef]+/g, match => ` $` + match.trim() + '$ ' );

                // 把英文单词前后的$去掉
                block[i] = block[i].replace(/\$([a-zA-Z]{2,})\$/g, '$1');
                
                //blocks[i] = processedBlock.replace(/__PLACEHOLDER\d+__/g, placeholder => tempMap[placeholder]);
            
            }
            else { //单行全公式块，只需整体前后加上$$
                blocks[i] = AddToStartEnd(blocks[i], "$$"); 
            }
            
        }
        outStr += blocks[i]+'\n';
    }

    return outStr;

    function AddToStartEnd(str, toAdd){
        return toAdd+str+toAdd;
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
                    tempStr += splits[k];
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
