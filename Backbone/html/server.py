import argparse
import tornado.web
import tornado.httpserver
import tornado.ioloop


class HtmlFileHandler(tornado.web.RequestHandler):
    def get(self):
        with open("todos.html", 'r') as f:
            html = f.read()
        print(html)
        self.write(html)

if __name__ == "__main__":
    bindport = 4545
    bindhost = "0.0.0.0"
    sslport = 4546
    sslhost = "0.0.0.0"
    parser = argparse.ArgumentParser()
    parser.add_argument("-http", help="host:port for http connections")
    parser.add_argument("-https", help="host:port for https connections")
    args = parser.parse_args()

    if args.http:
        bindhost, bindport = args.http.split(":")

    if args.https:
        sslhost, sslport = args.https.split(":")

    application = tornado.web.Application([
        (r"/", HtmlFileHandler),
    ])

    https_server = tornado.httpserver.HTTPServer(application, ssl_options={
        "certfile": "/etc/ssl/localcerts/tornado.pem",
        "keyfile": "/etc/ssl/localcerts/tornado.key",
    })

    http_server = tornado.httpserver.HTTPServer(application)

    https_server.listen(sslport, sslhost)
    http_server.listen(bindport, bindhost)
    tornado.ioloop.IOLoop.instance().start()
