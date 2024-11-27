function sendMessage(speed,message) {
    // 创建一个新的回答元素
    const sendMessage = document.createElement('div');
    sendMessage.classList.add('message');

    
    // 设置消息内容和样式
    sendMessage.style.borderRadius = '5px';
    sendMessage.style.backgroundColor = '#591414';
    sendMessage.style.color = 'white';
    sendMessage.style.padding = '5px 10px';
    sendMessage.style.marginBottom = '10px';
    sendMessage.style['text-align'] = 'right';

    
    setTimeout(()=>{    // 将回答添加到对话展示框中
        chatDisplay.appendChild(sendMessage);

    let index = 0;
    function printCharacter() {
        if (index < message.length) {
            // 将下一个字符追加到输出中
            sendMessage.innerHTML += message[index];
            index++;
            // 每隔 500 毫秒输出下一个字符
        setTimeout(printCharacter, speed);
        }
    }
    // 开始逐个字符输出
    printCharacter();
    // 每次添加新内容后滚动页面到对话框
    sendMessage.scrollIntoView({ behavior: 'smooth' });

    },500)
}    