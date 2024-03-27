from sqlite3 import connect


class DatabaseManager:
    def __init__(self, db_name='bing_news_articles'):
        self.db_name = db_name
        self.initialization()

    @staticmethod
    def open_and_close_db(func):
        def wrapper(self, *args, **kwargs):
            self.connect_to_database(self.db_name)
            result = func(self, *args, **kwargs)
            self.close_db()
            return result
        return wrapper

    def connect_to_database(self, db_name):
        self.__conn = connect(db_name)
        self.__cursor = self.__conn.cursor()

    def close_db(self):
        self.__conn.close()

    @open_and_close_db
    def initialization(self):
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

    @open_and_close_db
    def fetch_articles(self, offset=0, limit=20):
        self.__cursor.execute(f'''SELECT * FROM articles
                                  ORDER BY date ASC, time ASC
                                  LIMIT {limit} OFFSET {offset};''')
        return self.__cursor.fetchall()

    @open_and_close_db
    def get_count(self):
        self.__cursor.execute('SELECT COUNT(*) FROM articles')
        return self.__cursor.fetchone()[0]

    @open_and_close_db
    def add_bookmark_article(self, article_id):
        self.__cursor.execute(f'''INSERT INTO saved_articles (article_id)
                                  VALUES ("{article_id}");''')
        self.__conn.commit()
        print(self.get_saved_articles())

    @open_and_close_db
    def get_bookmark_articles(self):
        self.__cursor.execute('SELECT article_id FROM saved_articles')
        return self.__cursor.fetchall()


# dbm = DatabaseManager()
# dbm.add_saved_article('32')
# print(dbm.get_saved_articles())
