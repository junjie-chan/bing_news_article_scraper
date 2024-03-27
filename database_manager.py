from math import ceil
from pandas import read_excel, set_option
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
        self.__cursor.execute('''CREATE TABLE IF NOT EXISTS saved_articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id TEXT
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

    def get_count(self):
        self.__cursor.execute('SELECT COUNT(*) FROM articles')
        return self.__cursor.fetchone()[0]

    def add_saved_article(self, article_id):
        self.__cursor.execute(f'''INSERT INTO saved_articles (article_id)
                                  VALUES ("{article_id}");''')

    def get_saved_articles(self):
        self.__cursor.execute('SELECT article_id FROM saved_articles')
        return self.__cursor.fetchone()


# dbm = DatabaseManager()
# dbm.add_saved_article('96')
# print(dbm.get_saved_articles())
