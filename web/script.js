// const var=xxx;
const p = document.getElementById("test");

// eel.expose;
// function display(data) {
//   p.innerText = data["title"];
//   // eel.<python func>()
// }

// eel.get_data()(display);

// const b = document.getElementById("btn");
// b.addEventListener("click", (event) => {
//   p.innerHTML = "button clicked!";
//   //   eel.to_second_page();
//   // redirect
//   //   window.location.href = "test.html";
//   //   window.location.href = "https://www.google.com";
// });

$(document).ready(function () {
  /* Every time the window is scrolled ... */
  $(window).scroll(function () {
    /* Check the location of each desired element */
    $(".reveal").each(function (i) {
      var bottom_of_object = $(this).offset().top + $(this).outerHeight();
      var bottom_of_window = $(window).scrollTop() + $(window).height();

      /* If the object is completely visible in the window, fade it in */
      if (bottom_of_window > bottom_of_object) {
        $(this).animate({ opacity: "1" }, 1200);
        /* 1500 is the duration of fade effect */
      }
    });
  });
});

// eel.expose
// function display_articles() {
//   var inner_container = document.getElementsByClassName("inner_container")[0];
//   inner_container.insertAdjacentHTML("afterbegin", eel.get_articles());
// }

eel.expose(display_articles);
function display_articles() {
  // 调用 Python 中的 get_articles 函数，并使用 then 方法来处理返回的 Promise
  eel.get_articles()(function (html_content) {
    // 在 Promise 完成后，data 参数将包含 Python 函数的返回值
    // 现在你可以使用这个值在页面上显示文章
    var inner_container = document.getElementsByClassName("inner_container")[0];
    inner_container.insertAdjacentHTML("afterbegin", html_content);
  });
}
display_articles();

// inner_container.innerHTML = eel.get_articles();
