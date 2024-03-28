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
    var articles_container =
      document.getElementsByClassName("articles_container")[0];
    articles_container.innerHTML = html_content;
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

async function disable_button(button_index) {
  get_element_by_class_name(button_index).classList.add("disabled");
}

async function enable_button(button_index) {
  get_element_by_class_name(button_index).classList.remove("disabled");
}

function activate_button(new_button_index, current_active_button) {
  current_active_button.classList.remove("active");
  var button = get_element_by_class_name("index" + new_button_index);
  button.classList.add("active");

  // Display Page Content
  var page_no = parseInt(
    get_element_class_name(button, "page_").replace("page_", "")
  );
  display_articles(page_no);
}

async function move_buttons(clicked_button, maximum_pages) {
  var ul = document.querySelector("div.buttons_container > ul");
  var li_tags = ul.querySelectorAll("li");
  var page_no = get_page_no(clicked_button);
  var button_text = await eel.get_buttons_text(page_no, maximum_pages)();

  for (let i = 0; i < li_tags.length; i++) {
    var li_tag = li_tags[i];
    var li_class_list = li_tag.classList;
    // Change <li> text
    li_tag.querySelector("a").textContent = button_text[i];
    // Update class name page_
    li_class_list.remove(get_element_class_name(li_tag, "page_"));
    if (button_text[i] == "...") {
      li_class_list.add("page_ellipsis");
    } else {
      li_class_list.add("page_" + button_text[i]);
    }
    // 对省略号进行更新：disabled
    if (li_class_list.contains("disabled")) {
      li_class_list.remove("disabled");
    }
    if (button_text[i] == "...") {
      li_class_list.add("disabled");
    }
  }
}

async function show_section(container_name) {
  var inner_container = get_element_by_class_name("inner_container");
  var divs = inner_container.querySelectorAll(":scope > div");
  divs.forEach(function (div) {
    if (div.classList.contains(container_name)) {
      div.style.display = "block";
    } else {
      div.style.display = "none";
    }
  });
}

function get_button_text(button) {
  return button.querySelector("a").textContent;
}

// Load Content
display_sidebar();

document.addEventListener("DOMContentLoaded", (event) => {
  // Detect click action, e stands for event
  document.body.addEventListener("click", async function (e) {
    // If the "Results" button within the sidebar is clicked
    if (e.target.matches(".results_button")) {
      display_articles();
      display_next_page_buttons();
      show_section("results_container");
      // get_element_by_class_name("results_container").style.display = block;
    } else if (
      e.target.matches(".article_block .action_block i") ||
      e.target.matches(".article_block .action_block .save_button")
    ) {
      // If a bookmark button within the article block is clicked
      e.preventDefault();
      var article_id = e.target.closest(".article_block").getAttribute("id");
      eel.save_bookmark_articles(article_id);
    }
    // If a pagination button is clicked
    else if (e.target.matches(".pagination .page-link")) {
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
            // 激活previous按钮
            enable_button("index1");

            // 前4页为激活状态
            if ([2, 3, 4, 5].includes(active_index_int)) {
              activate_button(active_index_int + 1, active_button);
            } // 第5页为激活状态
            else if (active_index_int == 6) {
              await move_buttons(
                get_element_by_class_name("index7"),
                maximum_pages
              );
              activate_button(6, active_button);
            }
          }
          // 点击previous
          else if (clicked_text == "Previous") {
            // 只要第一页不是激活状态
            if (active_index_int > 2) {
              // 第三页是激活状态，取消previous按钮激活状态
              if (active_index_int == 3) {
                disable_button("index1");
              }
              activate_button(active_index_int - 1, active_button);
            }
          }
          // 其他
          else {
            // 激活previous按钮，只要点击的不是第一页
            enable_button("index1");
            // 点击第一页的时候取消previous按钮激活状态
            if (clicked_index_int == 2) {
              disable_button("index1");
            }

            // 点击前4页
            if ([2, 3, 4, 5].includes(clicked_index_int)) {
              activate_button(clicked_index_int, active_button);
            }
            // 点击其他页
            else if ([6, 7, 8, 9].includes(clicked_index_int)) {
              // 运行完move_buttons再运行activate_button
              await move_buttons(clicked_button, maximum_pages);
              activate_button(6, active_button);
            }
          }
        }
        // 结尾位置
        else if (index3_page_no == maximum_pages - 7) {
          // 点击next且当前激活页不是倒数第1页
          if (clicked_text == "Next" && active_index_int != 10) {
            // 点击next且当前激活页是倒数第3页，取消next按钮激活状态
            if (active_index_int == 9) {
              disable_button("index11");
            }
            activate_button(active_index_int + 1, active_button);
          }
          // 点击previous
          else if (clicked_text == "Previous") {
            // 激活next按钮
            enable_button("index11");

            // 后4页为激活状态
            if ([7, 8, 9, 10].includes(active_index_int)) {
              activate_button(active_index_int - 1, active_button);
            } // 倒数第5页为激活状态
            else if (active_index_int == 6) {
              await move_buttons(
                get_element_by_class_name("index5"),
                maximum_pages
              );
              activate_button(6, active_button);
            }
          }
          // 其他
          else {
            // 激活和取消next按钮
            if (clicked_index_int == 10) {
              disable_button("index11");
            } else {
              enable_button("index11");
            }

            // 点击后4页
            if ([7, 8, 9, 10].includes(clicked_index_int)) {
              activate_button(clicked_index_int, active_button);
            }
            // 点击其他页
            else if ([3, 4, 5, 6].includes(clicked_index_int)) {
              await move_buttons(clicked_button, maximum_pages);
              activate_button(6, active_button);
            }
          }
        }
        // 中间位置
        else {
          // 点击next
          if (clicked_text == "Next") {
            await move_buttons(
              get_element_by_class_name("index7"),
              maximum_pages
            );
            activate_button(6, active_button);
          }
          // 点击previous
          else if (clicked_text == "Previous") {
            await move_buttons(
              get_element_by_class_name("index5"),
              maximum_pages
            );
            activate_button(6, active_button);
          }
          // 其他
          else {
            //跳转到第1页
            if ([3, 4, 5].includes(get_page_no(clicked_button))) {
              await move_buttons(clicked_button, maximum_pages);
              activate_button(get_page_no(clicked_button) + 1, active_button);
            }
            // 跳转到最后1页
            else if ([16, 17, 18].includes(get_page_no(clicked_button))) {
              await move_buttons(clicked_button, maximum_pages);
              activate_button(get_page_no(clicked_button) - 10, active_button);
            }
            // 其他
            else {
              // 点击左右3页
              if ([3, 4, 5, 7, 8, 9].includes(clicked_index_int)) {
                await move_buttons(clicked_button, maximum_pages);
                activate_button(6, active_button);
              }
            }
          }
        }
      }
    }
  });
});

// Scrolling Animation
// $(document).ready(function () {
//   /* Every time the window is scrolled ... */
//   $(window).scroll(function () {
//     /* Check the location of each desired element */
//     $(".reveal").each(function (i) {
//       var bottom_of_object = $(this).offset().top + $(this).outerHeight();
//       var bottom_of_window = $(window).scrollTop() + $(window).height();

//       /* If the object is completely visible in the window, fade it in */
//       if (bottom_of_window > bottom_of_object) {
//         $(this).animate({ opacity: "1" }, 1200);
//         /* 1500 is the duration of fade effect */
//       }
//     });
//   });
// });
