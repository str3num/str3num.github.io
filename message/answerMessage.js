function answerMessage(message) {
        // 创建一个新的回答元素
        const AnswerMessage = document.createElement('div');
        AnswerMessage.classList.add('message');
    
        // 设置回答内容和样式
        AnswerMessage.style.borderRadius = '5px';
        AnswerMessage.style.backgroundColor = '#7a4242';
        AnswerMessage.style.color = 'white';
        AnswerMessage.style.padding = '5px 10px';
        AnswerMessage.style.marginBottom = '10px';
    
        
        setTimeout(()=>{    // 将回答添加到对话展示框中
            chatDisplay.appendChild(AnswerMessage);
    
        let index = 0;
        function printCharacter() {
            if (index < message.length) {
                // 将下一个字符追加到输出中
                AnswerMessage.innerHTML += message[index];
                index++;
                // 每次添加新内容后滚动页面到对话框
                AnswerMessage.scrollIntoView({ behavior: 'smooth' });
                // 每隔 500 毫秒输出下一个字符
            setTimeout(printCharacter, 50);
            }
        }
        // 开始逐个字符输出
        printCharacter();
    
        },500)
    }    