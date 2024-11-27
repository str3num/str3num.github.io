function chatContainer() {
    const placeholders = ["今天过得怎么样？", "努力学习了吗？", "11111111111111","直接点击“发送”可以搜索来自其他时空的碎片哦！"];
let a = 0;

function changePlaceholder() {
    const inputField = document.getElementById('message-input');
    var text = placeholders[a];
    inputField.placeholder = "";

    let i = 0;
    function qwer() {
    if (i < text.length) {
        // 将下一个字符追加到输出中
        inputField.placeholder += text[i];
        i++;
        // 每隔 500 毫秒输出下一个字符
    setTimeout(qwer, 50);
    }
}
// 开始逐个字符输出
qwer();

a = (a + 1) % placeholders.length;  // 循环索引
localStorage.setItem('index', a); // 存储 index 到 localStorage
}
setInterval(changePlaceholder, 5000);  // 每 2 秒切换一次
}