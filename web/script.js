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
function display_articles(page_no = 1) {
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

// Load Content
display_sidebar();
// display_articles();
display_next_page_buttons();

// 翻页处理
var active_button_name = 1; // Default

// Get the class name that contains specific string of an element
function get_element_class_name(element, name) {
  let classes = element.classList;

  for (let i = 0; i < classes.length; i++) {
    if (classes[i].includes(name)) {
      return classes[i];
    }
  }
}

function get_element_by_class_name(name) {
  return document.querySelectorAll('[class*="' + name + '"]')[0];
}

function get_page_no(button_element) {
  var page_name = get_element_class_name(button_element, "page_");
  return parseInt(page_name.replace("page_", ""));
}

function activate_button(new_button_index, current_active_button) {
  current_active_button.classList.remove("active");
  var button = get_element_by_class_name("index" + new_button_index);
  button.classList.add("active");
}

async function move_buttons(clicked_button, maximum_pages) {
  var ul = document.querySelector("div.buttons_container > ul");
  var li_tags = ul.querySelectorAll("li");
  var page_no = get_page_no(clicked_button);
  var button_text = await eel.get_buttons_text(page_no, maximum_pages)();

  for (let i = 0; i < li_tags.length; i++) {
    var li_tag = li_tags[i];
    // Change <li> text
    li_tag.querySelector("a").textContent = button_text[i];
    // Update class name page_
    li_tag.classList.remove(get_element_class_name(li_tag, "page_"));
    if (button_text[i] == "...") {
      li_tag.classList.add("page_ellipsis");
    } else {
      li_tag.classList.add("page_" + button_text[i]);
    }
    // 对省略号进行更新：disabled
    if (li_tag.classList.contains("disabled")) {
      li_tag.classList.remove("disabled");
    }
    if (li_tag.querySelector("a").textContent == "...") {
      li_tag.classList.add("disabled");
    }
  }
}

function get_button_text(button) {
  return button.querySelector("a").textContent;
}

// Get the page button that was clicked
document.addEventListener("DOMContentLoaded", (event) => {
  // Actions after the click
  document.body.addEventListener("click", async function (e) {
    if (e.target.matches(".pagination .page-link")) {
      var maximum_pages = await eel.get_maximum_pages()();

      // Get the current active button
      var active_button = get_element_by_class_name("active");
      var active_index = get_element_class_name(active_button, "index");
      var active_index_int = parseInt(active_index.replace("index", "")); // index number, 1~9, Previous=1

      // Check which button was clicked
      var clicked_button = e.target.parentNode;
      var clicked_index = get_element_class_name(clicked_button, "index");
      var clicked_index_int = parseInt(clicked_index.replace("index", ""));
      var clicked_text = get_button_text(clicked_button);

      // 点击已经激活的按钮会没反应
      if (clicked_index_int != active_index_int) {
        var index3 = get_element_by_class_name("index3");
        var index3_page_no = get_page_no(index3);

        // 开始位置
        if (index3_page_no == 2) {
          // 点击next
          if (clicked_text == "Next") {
            // 前3页为激活状态
            if ([2, 3, 4, 5].includes(active_index_int)) {
              activate_button(active_index_int + 1, active_button);
            } // 第5页为激活状态
            if (active_index_int == 6) {
              activate_button(6, active_button);
              move_buttons(get_element_by_class_name("index7"), maximum_pages);
            }
          }
          // 点击previous
          else if (clicked_text == "Previous") {
            // 只要第一页不是激活状态
            if (active_index_int > 2) {
              activate_button(active_index_int - 1, active_button);
            }
          }
          // 其他
          else {
            // 点击前4页
            if ([2, 3, 4, 5].includes(clicked_index_int)) {
              activate_button(clicked_index_int, active_button);
            }
            // 点击其他页
            else if ([6, 7, 8, 9].includes(clicked_index_int)) {
              activate_button(6, active_button);
              move_buttons(clicked_button, maximum_pages);
            }
          }
        }
        // 结尾位置
        else if (index3_page_no == maximum_pages - 7) {
          // 点击next且当前激活页不是倒数第1页
          if (clicked_text == "Next" && active_index_int != 10) {
            activate_button(active_index_int + 1, active_button);
          }
          // 其他
          else {
            // 点击后4页
            if ([7, 8, 9, 10].includes(clicked_index_int)) {
              activate_button(clicked_index_int, active_button);
            }
            // 点击其他页
            else if ([3, 4, 5, 6].includes(clicked_index_int)) {
              activate_button(6, active_button);
              move_buttons(clicked_button, maximum_pages);
            }
          }
        }
        // 中间位置
        else {
          // 点击next
          if (clicked_text == "Next") {
            activate_button(6, active_button);
            move_buttons(get_element_by_class_name("index7"), maximum_pages);
          }
          // 其他
          else {
            //跳转到第1页
            if ([3, 4, 5].includes(get_page_no(clicked_button))) {
              activate_button(get_page_no(clicked_button) + 1, active_button);
              move_buttons(clicked_button, maximum_pages);
            }

            // 其他
            else {
              // 点击左右3页
              if ([3, 4, 5, 7, 8, 9].includes(clicked_index_int)) {
                activate_button(6, active_button);
                move_buttons(clicked_button, maximum_pages);
              }
            }
          }
        }
      }
    }
  });
});

//   // Update active
//   if (clicked_button_name == "Next" && active_page < maximum_pages) {
//     console.log("active index: " + active_index);
//     active_button.classList.remove("active");

//     // var new_button = document.querySelectorAll(
//     //   '[class*="index' + (active_index + 1) + '"]'
//     // )[0];
//     console.log("index" + (active_index + 1));
//     console.log(
//       document.getElementsByClassName("index" + (active_index + 1))
//     );

//     // page_to_display = active_page + 1;
//   }

// new_button.classList.add("active");

// if (active_page != clicked_button_name) {
//   // Actions for previous and next buttons & Navigate to page
//   if (["Previous", "Next"].includes(clicked_button_name)) {
//     // Find out the page to be displayed
//     if (clicked_button_name == "Previous" && active_page > 1) {
//       page_to_display = active_page - 1;
//     } else if (
//       clicked_button_name == "Next" &&
//       active_page < (await eel.get_maximum_pages()())
//     ) {
//       page_to_display = active_page + 1;
//     } else {
//       page_to_display = active_page;
//     }
//   } else if (active_page != clicked_button_name) {
//     page_to_display = clicked_button_name;
//   }

//   if (clicked_button_name != "...") {
//     // Remove active from its class list
//     active_button.classList.remove("active");
//     // Set the next active page and display articles
//     var page_to_activate = document.querySelectorAll(
//       '[class*="page_' + page_to_display + '"]'
//     )[0];
//     page_to_activate.classList.add("active");
//     display_articles(parseInt(page_to_display));
//   }
// }
// }
