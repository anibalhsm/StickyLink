from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('main.html')

@app.route('/Login')
def login():
    return render_template('login.html')

@app.route('/Products')
def products():
    return render_template('products.html')

@app.route('/Contact')
def contact():
    return render_template('contact.html')

@app.route('/Shop')
def shop():
    return render_template('shop.html')

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:your_password@your_host/your_database'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


if __name__ == '__main__':
    app.run(debug=True)