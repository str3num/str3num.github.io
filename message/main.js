// 获取元素
const messageInput = document.getElementById('message-input');
const submitBtn = document.getElementById('submit-btn');
const chatDisplay = document.querySelector('.chat-display');

// 添加事件监听器
submitBtn.addEventListener('click', sendMessage);

// 定义函数：发送消息
function sendMessage() {
    // 获取输入的消息内容
    let message = messageInput.value;

    if (messageInput.value==='')
    {
        linkMessage() //调用linkMessage函数
    }
    else
    { 
        sendMessage(message) //调用sendMessage函数
        var str = message;
        //估值一个亿的ai代码
        str = str.replace("吗", "");
        str = str.replace("？", "！");
        str = str.replace("? ", "! ");
        str = str.replace("?", "!");
        str = str.replace("你", "我");
        message = str.replace("我好", "你好");
        speed25(message) //调用sendMessage函数
    }
    
    // 清空输入框
    messageInput.value = '';
}

