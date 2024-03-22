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

function activate_button(new_button_index, current_activate_button) {
  var button = get_element_by_class_name("index" + new_button_index);
  button.classList.add("active");
  current_activate_button.classList.remove("active");
}

// Get the page button that was clicked
document.addEventListener("DOMContentLoaded", (event) => {
  // Actions after the click
  document.body.addEventListener("click", async function (e) {
    if (e.target.matches(".pagination .page-link")) {
      // Get the current active button
      var active_button = get_element_by_class_name("active");
      var active_index = get_element_class_name(active_button, "index");
      var active_index_int = parseInt(active_index.replace("index", "")); // index number, 1~9, Previous=1

      // Check which button was clicked
      var clicked_button = e.target.parentNode;
      var clicked_index = get_element_class_name(clicked_button, "index");
      var clicked_index_int = parseInt(clicked_index.replace("index", ""));

      // 点击已经激活的按钮或省略号会没反应
      if (
        clicked_button.textContent != active_button.textContent &&
        clicked_index_int != 5
      ) {
        // 不需要移动按钮的情况：点击的按钮不是第4或6个、点击next的时候当前没有激活第三个按钮、点击previous的时候当前没有激活第七个按钮

        if (
          [4, 6].includes(clicked_index) ||
          (clicked_index_int == 9 && active_index_int == 3) ||
          (clicked_index_int == 1 && active_index_int == 7)
        ) {
        } else {
          // 点击next或previous的情况
          if (clicked_index_int == 1 && get_page_no(clicked_button) != 1) {
            // console.log("navigate to index:" + clicked_index_int - 1);
            // activate_button(clicked_index_int - 1, active_button);
          } else if (clicked_index_int == 9) {
          } else {
            activate_button(clicked_index_int, active_button);
            // display_articles(get_page_no(clicked_button));
          }
        }
      }

      // var maximum_pages = await eel.get_maximum_pages()();
      // // No ellipsis
      // if (maximum_pages <= 5) {
      // } else {
      //   // Get the active page
      //   // var active_page = parseInt(active_button.textContent);

      //   // 更新分页所在位置，如：1,2,3...,5,6，那么如果点击3就应该将其往左移动一格
      //   // Update li with index 2-8 (exclude Previous & Next), move all li to left or right
      //   var ul = document.querySelector("div.buttons_container > ul");
      //   var li_tags = ul.querySelectorAll("li");
      //   for (let i = 1; i < li_tags.length - 1; i++) {
      //     // Exclude the ellipsis button
      //     if (i != 4) {
      //       var li_tag = li_tags[i];
      //       if (clicked_index_int == 9 && active_index_int == 3) {
      //         // Change <li> text
      //         var page_no_on_tag = parseInt(li_tag.textContent) + 1;
      //         li_tag.querySelector("a").textContent = page_no_on_tag;
      //         // Update class name page_
      //         li_tag.classList.remove(get_element_class_name(li_tag, "page_"));
      //         li_tag.classList.add("page_" + page_no_on_tag);
      //       } else if (clicked_index_int == 1 && active_index_int == 7) {
      //         var page_no_on_tag = parseInt(li_tag.textContent) - 1;
      //         li_tag.querySelector("a").textContent = page_no_on_tag;
      //         // Update class name page_
      //         li_tag.classList.remove(get_element_class_name(li_tag, "page_"));
      //         li_tag.classList.add("page_" + page_no_on_tag);
      //       }
      //     }
      //   }

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
    }
  });
});
