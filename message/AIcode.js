//价值一个亿的 AI 核心代码！
function AIcode(str) {
    str = str.replace("吗", "");
    str = str.replace("？", "！");
    str = str.replace("? ", "! ");
    str = str.replace("?", "!");
    str = str.replace("你", "我");
    str = str.replace("我好", "你好");
    return str;
}