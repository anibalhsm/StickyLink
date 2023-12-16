from flask import Flask, render_template, request
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

# Assuming you have a dictionary to store user data
users = {}

@app.route('/')
def home():
    return render_template('main.html')

@app.route('/Login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Check if user exists and the password is correct
        if username in users and check_password_hash(users[username], password):
            return redirect(url_for('home'))
        else:
            return 'Invalid username or password'
    else:
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

if __name__ == '__main__':
    app.run(debug=True)
