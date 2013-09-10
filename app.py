from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
  return render_template("comic.html")

@app.route("/test")
def test():
  return render_template("comicback.html")

if __name__ == "__main__":
  app.run("0.0.0.0")
