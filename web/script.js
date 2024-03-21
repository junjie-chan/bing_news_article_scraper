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

// Display Sidebar
eel.expose(display_sidebar);
function display_sidebar() {
  eel.generate_sidebar_code()(function (html_content) {
    var sidebar_container =
      document.getElementsByClassName("sidebar_container")[0];
    sidebar_container.insertAdjacentHTML("afterbegin", html_content);
  });
}

// Display Article Blocks
eel.expose(display_articles);
function display_articles(page_no) {
  // 调用 Python 中的 get_articles 函数，并使用 then 方法来处理返回的 Promise
  eel.generate_page_article_blocks(page_no)(function (html_content) {
    // 在 Promise 完成后，data 参数将包含 Python 函数的返回值
    // 现在你可以使用这个值在页面上显示文章
    var inner_container =
      document.getElementsByClassName("articles_container")[0];
    // inner_container.insertAdjacentHTML("afterbegin", html_content);
    inner_container.innerHTML = html_content;
  });
}

// Display Next Page Buttons
eel.expose(display_next_page_buttons);
function display_next_page_buttons() {
  eel.generate_page_buttons()(function (html_content) {
    // Find the container
    var buttons_container =
      document.getElementsByClassName("buttons_container")[0];
    // Add HTML codes
    buttons_container.insertAdjacentHTML("afterbegin", html_content);
  });
}

// Load Article Source Page by URL
function load_url(url) {
  window.open(url, "_blank");
}

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

// eel.expose(get_max_pages);
// function get_max_pages() {
//   return eel.get_maximum_pages();
// }

// Load Content
display_sidebar();
display_articles(1);
display_next_page_buttons();

// 翻页处理
var active_button_name = 1; // Default

// Get the page button that was clicked
document.addEventListener("DOMContentLoaded", (event) => {
  document.body.addEventListener("click", async function (e) {
    if (e.target.matches(".pagination .page-link")) {
      // Actions after the click
      // Check which button was clicked
      var clicked_button = e.target;
      var clicked_button_name = clicked_button.textContent;

      // Get the current active button
      var active_button = document.querySelectorAll('[class*="active"]')[0];
      // Get the active page
      var active_page = parseInt(active_button.textContent);

      if (active_page != clicked_button_name) {
        // Actions for previous and next buttons
        if (["Previous", "Next"].includes(clicked_button_name)) {
          // Find out the page to be displayed
          if (clicked_button_name == "Previous" && active_page > 1) {
            page_to_display = active_page - 1;
          } else if (
            clicked_button_name == "Next" &&
            active_page < (await eel.get_maximum_pages()())
          ) {
            page_to_display = active_page + 1;
          } else {
            page_to_display = active_page;
          }
        } else if (active_page != clicked_button_name) {
          page_to_display = clicked_button_name;
        }

        if (clicked_button_name != "...") {
          // Remove active from its class list
          active_button.classList.remove("active");
          // Set the next active page and display articles
          var page_to_activate = document.querySelectorAll(
            '[class*="page_' + page_to_display + '"]'
          )[0];
          page_to_activate.classList.add("active");
          display_articles(parseInt(page_to_display));
        }
      }
    }
  });
});
