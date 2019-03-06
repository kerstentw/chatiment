#!/bin/python3

import web
import json
from bs4 import BeautifulSoup as BS


urls = (
    "^/telegramTranslate", TelegramTranslator
)

class TelegramTranslator(object):

    def GET(self):
        return json.dumps({"error":"This endpoint does not take GET requests"})

    def POST(self):
        post_data = web.data()
        raw_html = post_data.get("html_body")
        soup = BS(raw_html)

        return json.dumps({"data":""})
