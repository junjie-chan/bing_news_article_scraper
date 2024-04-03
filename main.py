
from random import randint
from requests import get
from time import sleep
from math import ceil
from eel import init, expose
from database_manager import DatabaseManager
from jinja2 import Environment, FileSystemLoader
from pandas import DataFrame, set_option, concat, merge

WINDOW_SIZE = (1300, 740)
ARTICLES_PER_PAGE = 10
COLUMN_NAMES = ['title', 'url', 'description', 'date', 'time', 'keyword']
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
def generate_no_articles_message():
    return '''<div class="no_articles_found">
                <i class="fa fa-exclamation-triangle fa-4x" aria-hidden="true"></i>
                <p class="no_articles_notice">No articles are found for this section!</p>
              </div>'''


@expose
def generate_page_article_blocks(page_no=1, articles_for='results_container', articles_per_page=ARTICLES_PER_PAGE):
    num_of_page = get_maximum_pages(articles_for)
    if num_of_page:
        articles = DataFrame(dbm.fetch_articles(
            articles_for, page_no-1, articles_per_page))
        articles.columns = ['id'] + COLUMN_NAMES
        articles['articles_for'] = articles_for
        articles = articles.to_dict(orient='records')
        return run_template('article_template.jinja', articles)
    return generate_no_articles_message()


@expose
def get_maximum_pages(articles_for="results_container"):
    return ceil(dbm.get_count(articles_for)/ARTICLES_PER_PAGE)


@expose
def generate_page_buttons(articles_for="results_container", starting_page=1):
    num_of_page = get_maximum_pages(articles_for)
    if num_of_page:
        tags = get_buttons_text(starting_page, num_of_page)
        return run_template('next_page_template.jinja', tags)
    return ''


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


@expose
def delete_articles_from_bin(article_id):
    dbm.delete_article(article_id)


# start('index.html', size=WINDOW_SIZE)

# Display Settings
set_option('display.max_rows', None)
set_option('display.max_columns', None)
set_option('display.expand_frame_repr', False)
set_option('display.float_format', lambda x: '%.2f' % x)  # 打印完整数据
set_option('display.max_colwidth', None)

# cc (country code): AU, HK, IN, ID, JP, KR, MY, NZ, CN, PH, TW
# 定义了 cc 就不需要定义 mkt
# q: 之在 /news/search endpoint 中必须有值
# GEONAMES_ACCOUNT = 'geo_checker'
BING_API_KEY = 'f75c19678e6f46f998b0e89be180f8c8'
KEYWORDS = ['mobility']
COUNT = 100
FRESHNESS = 'Week'
FILE_PATH = r'D:\用户文档转移\Desktop\articles_test.xlsx'

# API Initialization
search_url = "https://api.bing.microsoft.com/v7.0/news/search"
headers = {"Ocp-Apim-Subscription-Key": BING_API_KEY}

# Parameters
# countries = ['Australia', 'Hong Kong', 'India', 'Indonesia', 'Japan', 'Korea', 'Malaysia', 'NewZealand', 'China',
#              'Philippines', 'Taiwan']
countries = ['Australia']
markets = {'Australia': 'en-AU', 'Hong Kong': 'zh-HK', 'India': 'en-IN', 'Indonesia': 'en-ID', 'Japan': 'ja-JP',
           'Korea': 'ko-KR', 'Malaysia': 'en-MY', 'NewZealand': 'en-NZ', 'China': 'zh-CN', 'Philippines': 'en-PH',
           'Taiwan': 'zh-TW'}
previous_message = None


def fetch(params):
    response = get(search_url, headers=headers, params=params)
    response.raise_for_status()
    return response


def process_data(response, keyword):
    results = response.json()
    articles = [{'title': i.get('name'),
                 'url': i.get('url'),
                 'description': i.get('description'),
                 'about': ', '.join([a.get('name') for a in i.get('about', [])]),
                 'mentions': ', '.join([m.get('name') for m in i.get('mentions', [])]),
                 'date': i.get('datePublished').split('T')[0],
                 'time': i.get('datePublished').split('T')[1].split('.')[0],
                 'keyword': keyword
                 } for i in results.get('value')]
    return articles


def fetch_one_query(query):
    params = {
        'q': query,
        'count': COUNT,
        'mkt': '',
        'freshness': FRESHNESS,
        'sortBy': 'Relevance',
        'textFormat': 'HTML',
        'setLang': 'en-gb',
        'offset': 0
    }

    res = DataFrame(columns=COLUMN_NAMES)
    for country in countries:
        fetch_next_country = False

        while not fetch_next_country:
            params.update({'mkt': markets.get(country)})
            articles = DataFrame(process_data(fetch(params), query))
            articles = articles[COLUMN_NAMES]
            res = concat([res, articles], ignore_index=True)
            num_of_articles = articles.title.count()
            print(
                f'Keyword: "{query}", {country} News Count: {num_of_articles}')

            # Check if there are more articles available
            if num_of_articles < 100:
                params.update({'offset': 0})
                fetch_next_country = True
                break
            else:
                params.update({'offset': params.get('offset') + 100})
                fetch_next_country = False

            sleep(randint(5, 10) / 10)  # 0.5-1s
    return res


def fetch_all():
    results = DataFrame(columns=COLUMN_NAMES)
    for keyword in KEYWORDS:
        results = concat([results, fetch_one_query(keyword)],
                         ignore_index=True)

    results = results.drop_duplicates('title')
    results['is_bookmarked'] = 0
    results['is_in_bin'] = 0

    db_data = dbm.fetch_all()
    if db_data:
        db_data = DataFrame(db_data)
        db_data.columns = COLUMN_NAMES+['is_bookmarked', 'is_in_bin']
        db_data.drop_duplicates('title', inplace=True)

        final = concat([results, db_data], ignore_index=True)
        final.drop_duplicates('title', inplace=True)

        final.set_index('title', inplace=True)
        db_data.set_index('title', inplace=True)
        final.update(db_data[['is_bookmarked', 'is_in_bin']])
        final.reset_index(inplace=True)

        dbm.clear_database()
        dbm.insert_articles(final.to_dict(orient='records'))
    else:
        dbm.insert_articles(results.to_dict(orient='records'))


fetch_all()
