function AIAnswer(message) {
        // 创建一个新的消息元素
        const newMessage = document.createElement('div');
        newMessage.classList.add('message');
    
        
        // 设置消息内容和样式
        newMessage.style.borderRadius = '5px';
        newMessage.innerHTML = message;
        newMessage.style.backgroundColor = '#591414';
        newMessage.style.color = 'white';
        newMessage.style.padding = '5px 10px';
        newMessage.style.marginBottom = '10px';
        newMessage.style['text-align'] = 'right';
        newMessage.scrollIntoView({ behavior: 'smooth' });
    
        // 将消息添加到对话展示框中
        chatDisplay.appendChild(newMessage);
        
        
        // 创建一个新的回答元素
        const AnswerMessage = document.createElement('div');
        AnswerMessage.classList.add('message');
    
        //价值一个亿的 AI 核心代码！
        var str = message;
        AIcode(str);
    
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
            if (index < str.length) {
                // 将下一个字符追加到输出中
                AnswerMessage.innerHTML += str[index];
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