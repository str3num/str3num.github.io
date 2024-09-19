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
        linkMessage() //调用linkMessage函数
    }
    else
    {
        AIAnswer(message) //调用AIAnswer函数
    }
    
    // 清空输入框
    messageInput.value = '';
}

