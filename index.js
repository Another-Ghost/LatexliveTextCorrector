document.getElementById('button').addEventListener('click', function(){
let text_input = document.getElementById('text1');
let text_output = document.getElementById('text2');
text_output.value = text_input.value.replace(/(\\[a-zA-Z]+\{[^}]*\})/g, '\$$1\$');
text_input.textContent;
});