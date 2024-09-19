function waitingMessage() {
            // 创建一个新等待元素
            const WaitingMessage = document.createElement('div');
            WaitingMessage.classList.add('message');
    
            //创建等待
            const arr = ['链接中.', '链接中..', '链接中...'];
    
            for (let i = 0; i < arr.length; i++) {
    
    
                setTimeout(()=>{
                    // 设置回答内容和样式
                    WaitingMessage.style.borderRadius = '5px';
                    WaitingMessage.innerHTML = arr[i];
                    WaitingMessage.style.backgroundColor = '#7a4242';
                    WaitingMessage.style.color = 'white';
                    WaitingMessage.style.padding = '5px 10px';
                    WaitingMessage.style.marginBottom = '10px';
    
                    // 滚动页面到对话框
                    WaitingMessage.scrollIntoView({ behavior: 'smooth' });
    
                    // 将回答添加到对话展示框中
                    chatDisplay.appendChild(WaitingMessage)
                }, i*300);
            }
        }