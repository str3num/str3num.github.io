var quotes = [
    '不可以色色！',
    '今日的风儿甚是喧嚣。',
    'ONLY MY RAILGUN!',
    '薯片半价！',
    '我们每天度过的日常，也许就是连续发生的奇迹。',
    '来和我签订契约吧！',
    '勇敢的少年快去创造奇迹!',
    '你是向日葵派还是蒲公英派?',
    '你们之中如果有外星人、未来人、异世界来客或者超能力者的话就来找我，完毕。'
  ]

// 获取元素
const messageInput = document.getElementById('message-input');
const submitBtn = document.getElementById('submit-btn');
const chatDisplay = document.querySelector('.chat-display');

// 添加事件监听器
submitBtn.addEventListener('click', sendMessage);

// 定义函数：发送消息
function sendMessage() {
    // 获取输入的消息内容
    const message = messageInput.value;

    if (messageInput.value==='')
    {
    // 创建一个新的回答元素
    const AnswerMessage = document.createElement('div');
    AnswerMessage.classList.add('message');

    //创建随机回答
    var randomNumber = Math.floor(Math.random()*quotes.length)

    // 设置回答内容和样式
    AnswerMessage.style.borderRadius = '5px';
    AnswerMessage.innerHTML = quotes[randomNumber];
    AnswerMessage.style.backgroundColor = '#7a4242';
    AnswerMessage.style.color = 'white';
    AnswerMessage.style.padding = '5px 10px';
    AnswerMessage.style.marginBottom = '10px';

    

    // 将回答添加到对话展示框中
    chatDisplay.appendChild(AnswerMessage);

    }
    else
    {
    
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

    // 将消息添加到对话展示框中
    chatDisplay.appendChild(newMessage);
    
    
    // 创建一个新的回答元素
    const AnswerMessage = document.createElement('div');
    AnswerMessage.classList.add('message');

    //价值一个亿的 AI 核心代码！
	var str = message;
    str = str.replace("吗", "");
    str = str.replace("？", "！");
    str = str.replace("? ", "! ");
    str = str.replace("?", "!");
    str = str.replace("你", "我");
    str = str.replace("我好", "你好");

    // 设置回答内容和样式
    AnswerMessage.style.borderRadius = '5px';
    AnswerMessage.innerHTML = str;
    AnswerMessage.style.backgroundColor = '#7a4242';
    AnswerMessage.style.color = 'white';
    AnswerMessage.style.padding = '5px 10px';
    AnswerMessage.style.marginBottom = '10px';

    

    // 将回答添加到对话展示框中
    chatDisplay.appendChild(AnswerMessage);
    }
    
    // 清空输入框
    messageInput.value = '';
}

