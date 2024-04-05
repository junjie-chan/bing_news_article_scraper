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
function display_articles(articles_for, page_no = 1) {
  // 调用 Python 中的 get_articles 函数，并使用 then 方法来处理返回的 Promise
  eel.generate_page_article_blocks(
    page_no,
    articles_for
  )(function (html_content) {
    // 在 Promise 完成后，data 参数将包含 Python 函数的返回值
    var container = get_element_by_class_name(articles_for + "_articles");
    container.innerHTML = html_content;

    // 如果显示的是收藏页，修改全部书签图标的颜色，并清空特效
    if (articles_for == "bookmarks_container") {
      var save_buttons = document.querySelectorAll(
        ".bookmarks_container_articles .save_button"
      );
      save_buttons.forEach(function (button) {
        button.style.color = "rgb(240, 156, 0)";
        button.title = "Remove from Bookmarks";
      });
    }
  });
}

// Display Next Page Buttons
eel.expose(display_next_page_buttons);
function display_next_page_buttons(articles_for = "results_container") {
  eel.generate_page_buttons(articles_for)(function (html_content) {
    // Find the container
    var buttons_container = get_element_by_class_name(
      articles_for + "_buttons"
    );
    // Add HTML codes
    buttons_container.innerHTML = html_content;
  });
}

// Display Country Buttons
eel.expose(display_country_buttons);
function display_country_buttons() {
  eel.generate_country_buttons()(function (html_content) {
    // Find the container
    var country_buttons_container = document.querySelector(
      ".country_buttons_container"
    );
    // Add HTML codes
    country_buttons_container.innerHTML = html_content;
    set_default_countries();
  });
}

// Display Freshness Buttons
eel.expose(display_freshness_buttons);
function display_freshness_buttons() {
  eel.generate_freshness_buttons()(function (html_content) {
    // Find the container
    var freshness_buttons_container = document.querySelector(
      ".freshness_buttons_container"
    );
    // Add HTML codes
    freshness_buttons_container.innerHTML = html_content;
    set_default_freshness();
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

// Get teh first element by a given class name
function get_element_by_class_name(name) {
  return document
    .querySelector("." + articles_for)
    .querySelectorAll('[class*="' + name + '"]')[0];
}

// Enable a button
async function enable_button(button_index) {
  get_element_by_class_name(button_index).classList.remove("disabled");
}

// Disable a button
async function disable_button(button_index) {
  get_element_by_class_name(button_index).classList.add("disabled");
}

// Activate a pagination button
function activate_button(new_button_index, current_active_button) {
  current_active_button.classList.remove("active");
  var button = get_element_by_class_name("index" + new_button_index);
  button.classList.add("active");

  // Display Page Content
  var page_no = parseInt(
    get_element_class_name(button, "page_").replace("page_", "")
  );
  display_articles(articles_for, page_no);
}

// Get the text within the button
function get_button_text(button) {
  return button.querySelector("a").textContent;
}

// Get the page number of a pagination button
function get_page_no(button_element) {
  var page_name = get_element_class_name(button_element, "page_");
  return parseInt(page_name.replace("page_", ""));
}

// Move the entire set of pagination buttons
async function move_buttons(clicked_button, maximum_pages) {
  var ul = document.querySelector("." + articles_for + "_buttons > ul");
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

// Show the content of a section and hide the others
async function show_section(container_name) {
  var inner_container = document.querySelector(".inner_container");
  var divs = inner_container.querySelectorAll(":scope > div");
  divs.forEach(function (div) {
    if (
      div.classList.contains(container_name) ||
      div.classList.contains("search_container")
    ) {
      div.style.display = "block";
    } else {
      div.style.display = "none";
    }
  });
}

// Delete an article from the database permanently
eel.expose(delete_article);
function delete_article() {
  document.getElementById(to_delete_article_id).remove();
  eel.delete_articles_from_bin(to_delete_article_id);
  // 如果删掉文章之后界面是空的，需要展示无文章提示
  if (
    get_element_by_class_name("bin_container_articles").innerHTML.trim() === ""
  ) {
    eel.generate_no_articles_message()(async function (html_content) {
      get_element_by_class_name("bin_container_articles").innerHTML =
        html_content;
      get_element_by_class_name("bin_container_buttons").innerHTML = "";
    });
  }
}

// Display messages to inform users that no articles are found
eel.expose(check_last);
function check_last() {
  if (articles_for == "bookmarks_container") {
    if (
      get_element_by_class_name(
        "bookmarks_container_articles"
      ).innerHTML.trim() === ""
    ) {
      eel.generate_no_articles_message()(async function (html_content) {
        get_element_by_class_name("bookmarks_container_articles").innerHTML =
          html_content;
        get_element_by_class_name("bookmarks_container_buttons").innerHTML = "";
      });
    }
  }
}

// Search box slide animation
function search_box_toggle() {
  $(".search_container").slideToggle(300);
}

// ==============================================================================================================
// ==============================================================================================================

// Initialization
var countries_included = [];
var freshness_included = "";
var articles_for = "results_container";
display_sidebar();
show_section(articles_for);
display_articles(articles_for);
display_next_page_buttons(articles_for);

// Deal with different button click events
var to_delete_article_id = "";
document.addEventListener("DOMContentLoaded", (event) => {
  // Detect click action, e stands for event
  document.body.addEventListener("click", async function (e) {
    // If the "Results" button within the sidebar is clicked
    if (e.target.matches(".results_button")) {
      articles_for = "results_container";
      show_section(articles_for);
      display_articles(articles_for);
      display_next_page_buttons(articles_for);
    }
    // If the "Bookmarks" button within the sidebar is clicked
    else if (e.target.matches(".bookmarks_button")) {
      articles_for = "bookmarks_container";
      show_section(articles_for);
      display_articles(articles_for);
      display_next_page_buttons(articles_for);
    }
    // If the "Trash Bin" button within the sidebar is clicked
    else if (e.target.matches(".bin_button")) {
      articles_for = "bin_container";
      show_section(articles_for);
      display_articles(articles_for);
      display_next_page_buttons(articles_for);
    }
    // If the "Settings" button within the sidebar is clicked
    else if (e.target.matches(".settings_button")) {
      articles_for = "";
      show_section("settings_container");
      display_freshness_buttons();
      display_country_buttons();
    }

    // If a bookmark button within the article block in "Results" section is clicked
    if (
      (e.target.matches(
        ".results_container_articles .article_block .action_block .fa-bookmark"
      ) ||
        e.target.matches(
          ".results_container_articles .article_block .action_block .save_button"
        )) &&
      articles_for == "results_container"
    ) {
      // 如果当前展示的是收藏页则将其移除收藏页
      e.preventDefault();
      // 获取对应文章的ID
      var article_block = e.target.closest(".article_block");
      var article_id = article_block.getAttribute("id");
      eel.save_bookmark_articles(article_id);
      // Remove the article
      article_block.remove();
    }
    // If a bookmark button within the article block in "Bookmark" section is clicked
    else if (
      (e.target.matches(
        ".bookmarks_container_articles .article_block .action_block .fa-bookmark"
      ) ||
        e.target.matches(
          ".bookmarks_container_articles .article_block .action_block .save_button"
        )) &&
      articles_for == "bookmarks_container"
    ) {
      // 如果当前展示的是收藏页则将其移除收藏页
      e.preventDefault();
      // 获取对应文章的ID
      var article_block = e.target.closest(".article_block");
      var article_id = article_block.getAttribute("id");
      eel.cancel_bookmark_articles(article_id);
      // Remove the article
      article_block.remove();
      check_last();
    }
    // If a close button within the article block in "Results" or "Bookmark" sections is clicked
    else if (
      e.target.matches(
        ".bookmarks_container_articles .article_block .action_block .fa-times"
      ) ||
      e.target.matches(
        ".bookmarks_container_articles .article_block .action_block .close_button"
      ) ||
      e.target.matches(
        ".results_container_articles .article_block .action_block .fa-times"
      ) ||
      e.target.matches(
        ".results_container_articles .article_block .action_block .close_button"
      )
    ) {
      // 移除文章到垃圾箱
      e.preventDefault();
      // 获取对应文章的ID
      var article_block = e.target.closest(".article_block");
      var article_id = article_block.getAttribute("id");
      eel.add_articles_to_bin(article_id);
      // Remove the article
      article_block.remove();
      check_last();
    }
    // If a close button within the article block in "Trash Bin" section is clicked
    else if (
      e.target.matches(
        ".bin_container_articles .article_block .action_block .fa-times"
      ) ||
      e.target.matches(
        ".bin_container_articles .article_block .action_block .close_button"
      )
    ) {
      // 移除文章到垃圾箱
      e.preventDefault();
      // 获取对应文章的ID
      var article_block = e.target.closest(".article_block");
      var article_id = article_block.getAttribute("id");
      to_delete_article_id = article_id;
    }

    // If the eye icon is clicked
    if (e.target.classList.contains("display_key")) {
      // Toggle
      if (e.target.classList.contains("fa-eye-slash")) {
        e.target.classList.remove("fa-eye-slash");
        e.target.classList.add("fa-eye");
        document.querySelector(".api_container input").type = "text";
      } else {
        e.target.classList.remove("fa-eye");
        e.target.classList.add("fa-eye-slash");
        document.querySelector(".api_container input").type = "password";
      }
    }

    // If the search button is clicked
    if (e.target.classList.contains("search_article_button")) {
      // Check if the search box is empty
      var input_box = document.querySelector(
        ".search_container .input_box input"
      );
      if (input_box.value.trim() == "") {
        var empty_search_box = new bootstrap.Modal(
          document.getElementById("empty_search_box")
        );
        empty_search_box.show();
      } else {
        // Check if an API key is provided
        var api_box = document.querySelector(".api_container input");
        if (api_box.value.trim() == "") {
          var api_needed = new bootstrap.Modal(
            document.getElementById("api_needed")
          );
          api_needed.show();
        } else {
          // Check if at least one country is selected
          if (countries_included.length == 0) {
            var country_needed = new bootstrap.Modal(
              document.getElementById("country_needed")
            );
            country_needed.show();
          } else {
            // Perform actual search
            // Clear the search box
            var input_element = document.querySelector(
              ".search_container input"
            );
            var keyword = input_element.value;
            input_element.value = "";
          }
        }
      }
    }

    // If a pagination button is clicked
    if (e.target.matches(".pagination .page-link")) {
      var maximum_pages = await eel.get_maximum_pages(articles_for)();
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

            // 处理页数只有2页的情况
            if (maximum_pages == 2) {
              activate_button(active_index_int + 1, active_button);
              disable_button("index4");
              enable_button("index1");
            }
            // 处理页数不足9页的情况
            else if (maximum_pages > 2 && maximum_pages < 9) {
              // 当前激活的是倒数第二页
              if (active_index_int == maximum_pages) {
                activate_button(active_index_int + 1, active_button);
                disable_button("index" + (maximum_pages + 2));
              } else {
                activate_button(active_index_int + 1, active_button);
              }
            }
            // 处理页数大于8页的情况
            else {
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
          }
          // 点击previous
          else if (clicked_text == "Previous") {
            enable_button("index" + (maximum_pages + 2));
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

            // 处理页数不足9页的情况
            if (maximum_pages > 1 && maximum_pages < 9) {
              // 点击第一页
              if (clicked_index_int == 2) {
                disable_button("index1");
                activate_button(2, active_button);
                enable_button("index" + (maximum_pages + 2));
              }
              // 点击最后一页
              else if (clicked_index_int == maximum_pages + 1) {
                disable_button("index" + (maximum_pages + 2));
                activate_button(maximum_pages + 1, active_button);
              }
              // 点击其他页
              else {
                activate_button(clicked_index_int, active_button);
                enable_button("index" + (maximum_pages + 2));
              }
            } else {
              if ([2, 3, 4, 5].includes(clicked_index_int)) {
                // 点击前4页
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
        } else if (maximum_pages > 8) {
          // 结尾位置（只对页数大于8页有效）
          if (index3_page_no == maximum_pages - 7) {
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
                activate_button(
                  get_page_no(clicked_button) - 10,
                  active_button
                );
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
    }
  });
});

// 默认隐藏搜索框
$(document).ready(function () {
  $(".search_container").hide();
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

// function search() {
// var input_element = document.querySelector(".search_container input");
// var keyword = input_element.value;
// input_element.value = "";
// }

// Toggle to activate and deactivate the freshness buttons
function toggle_freshness(button) {
  var freshness = button.textContent.trim();
  // 移除另一个是 active 类的按钮
  document
    .querySelector(".freshness_buttons_container .active")
    .classList.remove("active");
  // 点击新的按钮就要做修改，否则不变
  if (!button.classList.contains("active")) {
    // 为当前按钮添加 active 类
    button.classList.add("active");
    freshness_included = freshness;
  }
}

// Toggle to activate and deactivate the country buttons
function toggle_country(button) {
  var country = button.textContent.trim();
  // 检查按钮是否有 active 类
  if (button.classList.contains("active")) {
    // 移除 active 类
    button.classList.remove("active");
    countries_included.splice(countries_included.indexOf(country), 1);
  } else {
    // 添加 active 类
    button.classList.add("active");
    countries_included.push(country);
  }
}

// Set default freshness
function set_default_freshness() {
  freshness_included = "Week";
  document.getElementById(freshness_included).classList.add("active");
}

// Set default countries
function set_default_countries() {
  countries_included = [
    "Australia",
    "China",
    "Japan",
    "Korea",
    "Malaysia",
    "Philippines",
    "Indonesia",
    "Hong Kong",
    "Taiwan",
  ];
  countries_included.forEach(function (country_name) {
    document.getElementById(country_name).classList.add("active");
  });
}

function show_alert(message) {}
