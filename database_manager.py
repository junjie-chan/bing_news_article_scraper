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
                keyword TEXT,
                is_bookmarked BOOLEAN DEFAULT 0,
                is_in_bin BOOLEAN DEFAULT 0
            )
        ''')
        self.__conn.commit()

    @open_and_close_db
    def fetch_articles(self, articles_for='results_container', offset=0, limit=20):
        where_clause = 'WHERE is_bookmarked = 1' if articles_for == 'bookmarks_container' else ''
        self.__cursor.execute(f'''SELECT id, title, url, description, date, time, keyword 
                                  FROM articles
                                  {where_clause}
                                  ORDER BY date ASC, time ASC
                                  LIMIT {limit} OFFSET {offset};''')
        return self.__cursor.fetchall()

    @open_and_close_db
    def get_count(self, articles_for="results_container"):
        if articles_for == "results_container":
            self.__cursor.execute('SELECT COUNT(*) FROM articles')
        elif articles_for == "bookmarks_container":
            self.__cursor.execute('''SELECT COUNT(*) FROM articles 
                                     WHERE is_bookmarked = 1''')
        return self.__cursor.fetchone()[0]

    @open_and_close_db
    def add_bookmark_article(self, article_id):
        self.__cursor.execute(f'''UPDATE articles
                                  SET is_bookmarked = 1
                                  WHERE id = {article_id};
                               ''')
        self.__conn.commit()


# dbm = DatabaseManager()
# dbm.add_saved_article('32')
# print(dbm.get_bookmark_articles())
