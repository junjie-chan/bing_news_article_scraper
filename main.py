from jinja2 import Environment, FileSystemLoader
from eel import init, start, expose, show
from collections import deque
# import eel

init('web')
# 函数放在 .init 和 .start 之间


@expose
def get_data():
    return {'title': 1}


@expose
def to_second_page():
    show('test.html', size=(1400, 740))
    # show('http://www.google.com')


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


start('index.html', size=(1300, 740))
