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
function linkMessage() 
{
//------------------------- 创建等待元素 --------------------------
    waitingMessage();
//------------------------- 等待结束后创建回答 --------------------
    setTimeout(()=>{
            //创建随机回答
            var randomNumber = Math.floor(Math.random()*quotes.length)
            var message = quotes[randomNumber];
            //创建回答元素
            speed50(message);
    },1000);
}