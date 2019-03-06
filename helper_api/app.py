import web
import json
#from bs4 import BeautifulSoup as BS
import urllib

API_KEY = "a397325d785295fba75504e8059b5fba"
NOM_ENDPOINT = "https://api.nomics.com/v1/candles?key={key}&interval=1m&currency={currency}&start={starttime}&end={endtime}"
PORT = 8888
web.config.debug = False



urls = (
    r'/quick', "QuickPrice"
)

class CustomApp(web.application):
    def run(self, port = PORT, *middleware):
        func = self.wsgifunc(*middleware)
        return web.httpserver.runsimple(func, ('0.0.0.0', port))

    def wsgirun(self):
        return self.wsgifunc()

class QuickPrice(object):
    def GET(self):
        inputters = web.input()
        curr = inputters.get("curr")
        start = inputters.get("start")
        end = inputters.get("end")

        ep = NOM_ENDPOINT.format(key=API_KEY, currency=curr or "BTC", starttime = start, endtime = end )
        print(ep)
        resp = urllib.urlopen(ep)
        web.header("Access-Control-Allow-Origin", "*")

        return resp.read()


if __name__ == "__main__":
    app = CustomApp(urls, globals())
    app.run()
