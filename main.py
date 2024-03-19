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
def calculate_maximum_page(articles_per_page=20):
    return ceil(dbm.get_count()/articles_per_page)


@expose
def get_articles():
    data = [{'title': 'JSW INFRASTRUCTURE share price Today Live Updates : JSW INFRASTRUCTURE shares slide',
            'description': '''The government will soon introduce a standalone Act to allow major infrastructure projects to bypass lengthy resource consenting processes. The fast-track regime is the next step of the coalition government?€?s RMA reform agenda. A full replacement for the ...'''}]

    env = Environment(loader=FileSystemLoader('web/'))
    template = env.get_template('template.jinja')

    context = {
        'data': data
    }
    content = template.render(context)
    return content


@expose
def get_page_article_blocks(page_no=1, articles_per_page=20):
    articles = DataFrame(dbm.fetch_articles(page_no-1, articles_per_page))
    articles.columns = ['id', 'title', 'url',
                        'description', 'date', 'time', 'keyword']
    articles = articles.to_dict(orient='records')
    return run_template('article_template.jinja', articles)


start('index.html', size=WINDOW_SIZE)
