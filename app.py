from flask import Flask, render_template, request, redirect, url_for
from flask_mail import Mail, Message
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

@app.route('/Register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        # Check if username already exists
        if username in users:
            return 'Username already exists'
        else:
            users[username] = generate_password_hash(password)
            return redirect(url_for('login'))
    else:
        return render_template('register.html')

@app.route('/Products')
def products():
    return render_template('products.html')

@app.route('/Shop')
def shop():
    return render_template('shop.html')

#Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'anibaltafira17@gmail.com'  
app.config['MAIL_PASSWORD'] = 'pztyagghjaskpshd'

mail = Mail(app)

@app.route('/Contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        message = request.form['message']

        msg = Message('New contact form submission',
                      sender='your-email@example.com',
                      recipients=['200170770@aston.ac.uk'])
        msg.body = f'From: {name} <{email}>\n\n{message}'
        mail.send(msg)

        return redirect(url_for('contact')) 
    else:
        return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)
