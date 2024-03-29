from math import ceil
from eel import init, start, expose, show
from collections import deque
from database_manager import DatabaseManager
from jinja2 import Environment, FileSystemLoader
from pandas import DataFrame, set_option

WINDOW_SIZE = (1300, 740)
ARTICLES_PER_PAGE = 10
dbm = DatabaseManager()

# 函数放在 .init 和 .start 之间
init('web')


@expose
def run_template(file_name, data=None):
    env = Environment(loader=FileSystemLoader('web/templates/'))
    template = env.get_template(file_name)
    context = {'data': data}
    return template.render(context)


@expose
def generate_sidebar_code():
    return run_template('sidebar_template.jinja')


@expose
def generate_page_article_blocks(page_no=1, articles_for='results_container', articles_per_page=ARTICLES_PER_PAGE):
    articles = DataFrame(dbm.fetch_articles(
        articles_for, page_no-1, articles_per_page))
    articles.columns = ['id', 'title', 'url',
                        'description', 'date', 'time', 'keyword']
    articles = articles.to_dict(orient='records')
    return run_template('article_template.jinja', articles)


@expose
def get_maximum_pages(articles_for="results_container"):
    return ceil(dbm.get_count(articles_for)/ARTICLES_PER_PAGE)


@expose
def generate_page_buttons(articles_for="results_container", starting_page=1):
    num_of_page = get_maximum_pages(articles_for)
    tags = get_buttons_text(starting_page, num_of_page)
    return run_template('next_page_template.jinja', tags)


@expose
def get_buttons_text(clicked_page, max_pages):
    if max_pages == 1:
        return [1]
    elif max_pages > 1 and max_pages < 9:
        return ['Previous', *range(1, max_pages+1), 'Next']
    else:
        # 最前位置
        if clicked_page <= 5:
            return ['Previous', *range(1, 9), '...', 'Next']
        # 最后位置
        elif clicked_page >= max_pages-4:
            return ['Previous', '...', *range(max_pages-7, max_pages+1), 'Next']
        # 其他中间位置
        else:
            return ['Previous', '...', *range(clicked_page-3, clicked_page+4), '...', 'Next']


@expose
def save_bookmark_articles(article_id):
    dbm.add_bookmark_article(article_id)


@expose
def cancel_bookmark_articles(article_id):
    dbm.remove_bookmark_article(article_id)


@expose
def add_articles_to_bin(article_id):
    dbm.move_article_to_bin(article_id)


start('index.html', size=WINDOW_SIZE)
