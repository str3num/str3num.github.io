function sendMessage(message) {
    const sendMessage = document.createElement('div');
    sendMessage.classList.add('message');

    
    // 设置消息内容和样式
    sendMessage.style.borderRadius = '5px';
    sendMessage.innerHTML = message;
    sendMessage.style.backgroundColor = '#591414';
    sendMessage.style.color = 'white';
    sendMessage.style.padding = '5px 10px';
    sendMessage.style.marginBottom = '10px';
    sendMessage.style['text-align'] = 'right';
    sendMessage.scrollIntoView({ behavior: 'smooth' });

    // 将消息添加到对话展示框中
    chatDisplay.appendChild(sendMessage);
}
