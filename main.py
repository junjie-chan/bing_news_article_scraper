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
def generate_page_article_blocks(page_no=1, articles_per_page=ARTICLES_PER_PAGE):
    articles = DataFrame(dbm.fetch_articles(page_no-1, articles_per_page))
    articles.columns = ['id', 'title', 'url',
                        'description', 'date', 'time', 'keyword']
    articles = articles.to_dict(orient='records')
    return run_template('article_template.jinja', articles)


@expose
def get_maximum_pages():
    return ceil(dbm.get_count()/ARTICLES_PER_PAGE)


@expose
def generate_page_buttons(articles_per_page=ARTICLES_PER_PAGE, starting_page=1):
    num_of_page = get_maximum_pages()
    tags = ['Previous', *range(1, num_of_page+1), 'Next'] if num_of_page <= 8 else [
        'Previous', 1, 2, 3, 4, 5, 'ellipsis', num_of_page-2, num_of_page-1, num_of_page, 'Next']
    return run_template('next_page_template.jinja', tags)


@expose
def get_buttons_text(index4_value, max_pages):
    if index4_value < max_pages-6:
        if index4_value == 3:
            return ['Previous', *range(1, 6), '...', *range(max_pages-2, max_pages+1), 'Next']
        else:
            return ['Previous', *range(index4_value-2, index4_value), index4_value,
                    *range(index4_value+1, index4_value+3), '...', *
                    range(max_pages-2, max_pages+1), 'Next']
    else:
        return ['Previous', '...', *range(max_pages-7, max_pages+1), 'Next']


# start('index.html', size=WINDOW_SIZE)
print(get_maximum_pages())
