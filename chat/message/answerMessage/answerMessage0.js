function answerMessage0(message) {
    // 创建一个新的回答元素
    const AnswerMessage = document.createElement('div');
    AnswerMessage.classList.add('message');

    // 设置回答内容和样式
    AnswerMessage.style.borderRadius = '5px';
    AnswerMessage.style.backgroundColor = '#7a4242';
    AnswerMessage.style.color = 'white';
    AnswerMessage.style.padding = '5px 10px';
    AnswerMessage.style.marginBottom = '10px';
    AnswerMessage.innerHTML = message;
    chatDisplay.appendChild(AnswerMessage);
}    