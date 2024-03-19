from math import ceil
from eel import init, start, expose, show
from collections import deque
from database_manager import DatabaseManager
from jinja2 import Environment, FileSystemLoader
from pandas import DataFrame, set_option

WINDOW_SIZE = (1300, 740)
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
def generate_page_article_blocks(page_no=1, articles_per_page=20):
    articles = DataFrame(dbm.fetch_articles(page_no-1, articles_per_page))
    articles.columns = ['id', 'title', 'url',
                        'description', 'date', 'time', 'keyword']
    articles = articles.to_dict(orient='records')
    return run_template('article_template.jinja', articles)


@expose
def generate_page_buttons(articles_per_page=20, starting_page=1):
    num_of_page = ceil(dbm.get_count()/articles_per_page)
    tags = ['Previous', *range(1, num_of_page+1), 'Next'] if num_of_page <= 5 else [
        'Previous', 1, 2, 3, 'ellipsis', num_of_page-2, num_of_page-1, num_of_page, 'Next']
    return run_template('next_page_template.jinja', tags)


start('index.html', size=WINDOW_SIZE)
