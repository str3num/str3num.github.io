var quotes = [
    '今日的风儿甚是喧嚣。',
    'ONLY MY RAILGUN!',
    '薯片半价！',
    '我们每天度过的日常，也许就是连续发生的奇迹。',
    '来和我签订契约吧！',
    '勇敢的少年快去创造奇迹!',
    '你是向日葵派还是蒲公英派?',
    '你们之中如果有外星人、未来人、异世界来客或者超能力者的话就来找我，完毕。',
    '青春感果然和青春是不能同时存在的呢。'
]
//------------------------------------------------------------------------------
function linkMessage() {
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
//------------------------- 等待结束后创建回答 --------------------
        setTimeout(()=>{
            // 创建一个新的回答元素
            const AnswerMessage = document.createElement('div');
            AnswerMessage.classList.add('message');

            //创建随机回答
            var randomNumber = Math.floor(Math.random()*quotes.length)
            var quote = quotes[randomNumber];
            // 设置回答内容和样式
            AnswerMessage.style.borderRadius = '5px';
            AnswerMessage.style.backgroundColor = '#7a4242';
            AnswerMessage.style.color = 'white';
            AnswerMessage.style.padding = '5px 10px';
            AnswerMessage.style.marginBottom = '10px';

            // 将回答添加到对话展示框中
            chatDisplay.appendChild(AnswerMessage);

            let index = 0;
            function printCharacter() {
                if (index < quote.length) {
                    // 将下一个字符追加到输出中
                    AnswerMessage.innerHTML += quote[index];
                    index++;
                    // 每次添加新内容后滚动页面到对话框
                    AnswerMessage.scrollIntoView({ behavior: 'smooth' });
                    // 每隔 500 毫秒输出下一个字符
                setTimeout(printCharacter, 50);
                }
            }
            // 开始逐个字符输出
            printCharacter();
        },1000);
    }