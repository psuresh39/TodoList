import argparse
import tornado.web
import tornado.httpserver
import tornado.ioloop

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        with open("html/todos.html") as f:
            self.write(f.read())

if __name__ == "__main__":
    bindport = 4545
    bindhost = "0.0.0.0"
    parser = argparse.ArgumentParser()
    parser.add_argument("-http", help="host:port for http connections")
    args = parser.parse_args()

    if args.http:
        bindhost, bindport = args.http.split(":")

    application = tornado.web.Application([
        (r"/", MainHandler),
        (r"/(.+)", tornado.web.StaticFileHandler, {'path': "html"}),
    ])

    http_server = tornado.httpserver.HTTPServer(application)
    http_server.listen(bindport, bindhost)
    tornado.ioloop.IOLoop.instance().start()
