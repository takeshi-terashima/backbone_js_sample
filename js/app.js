var link_url = ["http://www.scsk-hokkaido.co.jp/",
                "https://www.scsk.jp/product/common/voic_finder/index.html",
                "https://nlp100.github.io/ja/",
                "https://www.javadrive.jp/javascript/",
                "https://dotinstall.com/lessons/basic_backbonejs"]

for (i = 0; i < 5; i++) {
    //マウスオーバー設定
    var elem = document.getElementById("btn" + i);
    elem.addEventListener("mouseover", function (event) {
        event.target.style.backgroundColor = "orange";
    }, false);
    elem.addEventListener("mouseleave", function (event) {
        event.target.style.backgroundColor = "#76d19c";
    }, false);
    $("#btn" + i).hover(function() {
        $(this).css('cursor','pointer');
    }, function() {
        $(this).css('cursor','auto');
    });
    //画面遷移処理
    $("#btn" + i).click(function()  {
        location.href=link_url[this.id.slice(-1)];
        return false;
    });
}

//画面遷移処理
$("#test").click(function()  {
    location.href="index2.html";
    return false;
});
var elem = document.getElementById("test");
elem.addEventListener("mouseover", function (event) {
    event.target.style.backgroundColor = "orange";
}, false);
elem.addEventListener("mouseleave", function (event) {
    event.target.style.backgroundColor = "#76d19c";
}, false);
$("#test").hover(function() {
    $(this).css('cursor','pointer');
}, function() {
    $(this).css('cursor','auto');
});

