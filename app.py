from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

# Tells flask-sqlalchemy what database to connect to
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
# Enter a secret key
app.config["SECRET_KEY"] = "abc"
# Initialize flask-sqlalchemy extension
db = SQLAlchemy()
# LoginManager is needed for our application 
# to be able to log in and out users
login_manager = LoginManager()
login_manager.init_app(app)

# Models
class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
 # Initialize app with extension
db.init_app(app)
# Create database within app context
 
with app.app_context():
    db.create_all()

# Creates a user loader callback that returns the user object given an id
@login_manager.user_loader
def loader_user(user_id):
    return Users.query.get(user_id)

@app.route('/')
def home():
    return render_template('main.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            flash('Username and password are required!', 'danger')
            return redirect(request.url)

        user = Users.query.filter_by(username=username).first()

        if not user:
            flash('User does not exist!', 'danger')
            return redirect(request.url)

        password_check = check_password_hash(user.password, password)
        print(f"Password Check: {password_check}")

        if not password_check:
            flash('Incorrect password!', 'danger')
            return redirect(request.url)

        # Add this block
        if password == '':
            flash('Password is required!', 'danger')
            return redirect(request.url)

        login_user(user)
        return redirect(url_for("account"))

    return render_template("login.html")

@app.route('/Register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        existing_user = Users.query.filter_by(username=request.form.get("username")).first()
        if existing_user:
            return "Username already exists! Please choose a different username."
        hashed_password = generate_password_hash(request.form.get("password"), method='pbkdf2:sha256')
        user = Users(username=request.form.get("username"), password=hashed_password)
        db.session.add(user)
        db.session.commit()
        return redirect(url_for("login"))
    else:
        return render_template("sign_up.html")

@app.route('/Account')
def account():
    return render_template('home.html')

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("account"))

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
        subject = request.form['subject']
        message = request.form['message']

        msg = Message(subject=subject,  # use the variable subject
                      sender=email,  # use the variable email
                      recipients=['StickyLink@outlook.com'])
        msg.body = f'From: {name} <{email}>\n\n{message}'
        mail.send(msg)
        return redirect(url_for('contact')) 
    else:
        return render_template('contact.html')

if __name__ == '__main__':
    app.run(debug=True)
