from sqlite3 import connect


class DatabaseManager:
    def __init__(self, db_name='bing_news_articles'):
        self.__conn = connect(db_name)
        self.__cursor = self.__conn.cursor()
        self.initialize_table()

    def initialize_table(self):
        self.__cursor.execute('''CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                url TEXT,
                description TEXT,
                date DATE,
                time TIME,
                keyword TEXT
            )
        ''')
        self.__conn.commit()

    def close_db(self):
        self.conn.close()

    # 定义一个函数来获取分页数据
    def fetch_articles(self, offset=0, limit=20):
        self.__cursor.execute(f'''SELECT * FROM articles
                                  ORDER BY date ASC, time ASC
                                  LIMIT {limit} OFFSET {offset};''')
        return self.__cursor.fetchall()

    def get_page_articles(self, page_num=1, limit=20):
        return self.fetch_articles(page_num - 1, limit)

    def get_count(self):
        self.__cursor.execute('SELECT COUNT(*) FROM articles')
        return self.__cursor.fetchone()[0]


conn = connect('bing_news_articles')
c = conn.cursor()
from pandas import read_excel, set_option
from math import ceil

df = read_excel(r'D:\用户文档转移\Desktop\Bing News API\bing_news_articles_v2.xlsx', usecols='A,B,C,F,G,H')
df.to_sql('articles', con=conn, if_exists='append', index=False)

dm = DatabaseManager()
