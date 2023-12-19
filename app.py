from flask import Flask, render_template, request, redirect, url_for
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user
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

@app.route("/login", methods=["GET", "POST"])
def login():
    # If a post request was made, find the user by 
    # filtering for the username
    if request.method == "POST":
        user = Users.query.filter_by(
            username=request.form.get("username")).first()
        # Check if the password entered is the 
        # same as the user's password
        if user.password == request.form.get("password"):
            # Use the login_user method to log in the user
            login_user(user)
            return redirect(url_for("account"))
        # Redirect the user back to the home
        # (we'll create the home route in a moment)
    return render_template("login.html")

@app.route('/Register', methods=['GET', 'POST'])
def register():
    if request.method == "POST":
        user = Users(username=request.form.get("username"),
                     password=request.form.get("password"))
        db.session.add(user)
        db.session.commit()
        return redirect(url_for("login"))
    return render_template("sign_up.html")


@app.route('/Account')
def account():
    return render_template('home.html')

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("home"))

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
