var quotes = [
  '不可以色色！',
  '今日的风儿甚是喧嚣。',
  'ONLY MY RAILGUN!',
  '薯片半价！',
  '我们每天度过的日常，也许就是连续发生的奇迹。',
  '来和我签订契约吧！',
  '勇敢的少年快去创造奇迹!',
  '你是向日葵派还是蒲公英派?'
]

function changetxt(){
  var randomNumber = Math.floor(Math.random()*quotes.length)
  document.getElementById('001').innerHTML = quotes[randomNumber]
}