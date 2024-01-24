from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)


#db connection
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = "abc"
db = SQLAlchemy()
migrate = Migrate(app, db)
login_manager = LoginManager()
login_manager.init_app(app)

#Db
class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    role = db.Column(db.String(250), default ='user')

class Product(db.Model):
    __tablename__ = 'product'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    image_url = db.Column(db.String(255))
    
db.init_app(app)

@login_manager.user_loader
def loader_user(user_id):
    return Users.query.get(user_id)


@app.route('/products')
def products():
    products = Product.query.all()
    return render_template('products.html', products=products)

@app.route('/add_product', methods=['POST'])
#@login_required
def add_product():
    if current_user.role != 'admin':
         return "Only admins can delete products!"
    name = request.form.get('name')
    description = request.form.get('description')
    price = float(request.form.get('price'))
    image_url = request.form.get('image_url')

    new_product = Product(name=name, description=description, price=price, image_url=image_url)
    db.session.add(new_product)
    db.session.commit()

    return redirect(url_for('products'))

@app.route('/delete_product/<int:id>', methods=['POST'])
#@login_required  
def delete_product(id):
    if current_user.role != 'admin': 
        return "Only admins can delete products!"

    product_to_delete = Product.query.get(id)
    db.session.delete(product_to_delete)
    db.session.commit()

    return redirect(url_for('products'))

@app.route('/admin/users')
#@login_required
def admin_users():
    if current_user.role != 'admin':
        return "Only admins can view this page!"

    users = Users.query.all()
    return render_template('admin_users.html', users=users)

from flask import request

@app.route('/change_role', methods=['POST'])
def change_role():
    username = request.form.get('username')
    role = request.form.get('role')

    user = Users.query.filter_by(username=username).first()
    if user is None:
        return "User not found!", 404

    user.role = role
    db.session.commit()

    return "Role changed successfully!"

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

        msg = Message(subject=subject, 
                      sender=email,
                      recipients=['StickyLink@outlook.com'])
        msg.body = f'From: {name} <{email}>\n\n{message}'
        mail.send(msg)
        return redirect(url_for('contact')) 
    else:
        return render_template('contact.html')

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
