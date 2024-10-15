// 获取元素
const messageInput = document.getElementById('message-input');
const submitBtn = document.getElementById('submit-btn');
const chatDisplay = document.querySelector('.chat-display');

// 添加事件监听器
submitBtn.addEventListener('click', sendMessage1);

// 定义函数：发送消息
function sendMessage1() {
    // 获取输入的消息内容
    let message = messageInput.value;
    const index = localStorage.getItem('index');

    if (messageInput.value==='')
    {
        switch (index) {
            case "1":
                message = "今天不开心！";
                sendMessage(50,message);
                break; // 结束当前 case
            case "2":
                message = "不想学习！";
                sendMessage(50,message);
                break; // 结束当前 case
            case "3":
                message = "11111111111111111";
                sendMessage(50,message);
                break; // 结束当前 case
            default:
                linkMessage(); // 如果没有匹配的 case，调用linkMessage函数
        }
    }
    else
    { 
        sendMessage(50,message) //调用sendMessage函数
        var str = message;
        //估值一个亿的ai代码
        str = str.replace("吗", "");
        str = str.replace("？", "！");
        str = str.replace("? ", "! ");
        str = str.replace("?", "!");
        str = str.replace("你", "我");
        message = str.replace("我好", "你好");
        answerMessage50(message) //调用sendMessage函数
    }
    
    // 清空输入框
    messageInput.value = '';
}

