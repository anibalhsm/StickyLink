import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_mail import Mail, Message
from flask_migrate import Migrate
import click
from flask.cli import with_appcontext
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.config['MAIL_SERVER'] = 'smtp.googlemail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'anibaltafira17@gmail.com'  
app.config['MAIL_PASSWORD'] = 'pztyagghjaskpshd'
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["SECRET_KEY"] = "abc"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
mail = Mail(app)

class Users(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(250), unique=True, nullable=False)
    password = db.Column(db.String(250), nullable=False)
    role = db.Column(db.String(250), default='user')
    
    def to_dict(self):
        return {
            'username': self.username,
            'role': self.role
        }

class Product(db.Model):
    __tablename__ = 'product'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    image_url = db.Column(db.String(255))

@click.command('promote-to-admin')
@click.argument('username')
@with_appcontext
def promote_to_admin(username):
    user = Users.query.filter_by(username=username).first()
    if not user:
        click.echo(f"User {username} not found.")
        return
    user.role = 'admin'
    db.session.commit()
    click.echo(f"User {username} has been promoted to admin.")

@login_manager.user_loader
def loader_user(user_id):
    return db.session.query(Users).get(int(user_id))

@app.route('/products')
def products():
    products = Product.query.all()
    return render_template('products.html', products=products)

@app.route('/add_product', methods=['POST'])
@login_required
def add_product():
    if current_user.role != 'admin':
        return "Only admins can add products!"
    
    name = request.form.get('name')
    description = request.form.get('description')
    price = request.form.get('price')
    
    default_image_url = url_for('static', filename='logo.png')
    image_url = default_image_url

    if 'image' in request.files:
        image_file = request.files['image']
        if image_file.filename == '':
            flash('No selected file')
            return redirect(url_for('products'))
        else:
            filename = secure_filename(image_file.filename)
            image_file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            image_url = url_for('static', filename='uploads/' + filename)

    new_product = Product(name=name, description=description, price=price, image_url=image_url)
    db.session.add(new_product)
    db.session.commit()
    
    flash('Product added successfully!')
    return redirect(url_for('products'))

@app.route('/get_users', methods=['GET'])
def get_users():
    users = Users.query.all()
    users_dict = [user.to_dict() for user in users]
    return jsonify(users_dict)

@app.route('/delete_product/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    try:
        product = Product.query.get(product_id)

        if product is not None:
            db.session.delete(product)
            db.session.commit()
            return "Product deleted successfully", 200
        else:
            return "Product not found", 404
    except Exception as e:
        return f"An error occurred while deleting the product: {str(e)}", 500

@app.route('/admin/users')
@login_required
def admin_users():
    try:
        if current_user.role != 'admin':
            return "Only admins can view this page!", 403

        users = Users.query.all()
        return render_template('admin_users.html', users=users)
    except Exception as e:
        return f"An error occurred while retrieving users: {str(e)}", 500

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

@app.route('/delete_user/<username>', methods=['DELETE'])
def delete_user(username):
    try:
        user = Users.query.filter_by(username=username).first()
        if user is not None:
            db.session.delete(user)
            db.session.commit()
            return "User deleted successfully", 200
        else:
            return "User not found", 404
    except Exception as e:
        return f"An error occurred while deleting the user: {str(e)}", 500


@app.route('/change_password', methods=['POST'])
@login_required
def change_password():
    old_password = request.form.get('old_password')
    new_password = request.form.get('new_password')

    if not check_password_hash(current_user.password, old_password):
        flash('Your old password is incorrect.')
        return redirect(url_for('account'))

    current_user.password = generate_password_hash(new_password)
    db.session.commit()

    flash('Your password has been updated.')
    return redirect(url_for('account'))

@app.route('/reset_password/<username>', methods=['GET', 'POST'])
@login_required
def reset_password(username):
    user = Users.query.filter_by(username=username).first()
    if user:
        user.password = generate_password_hash('StickyLink')
        db.session.commit()
        flash('Password has been reset.')
    else:
        flash('User not found.')
    return redirect(url_for('admin_users'))

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
@login_required
def account():
    return render_template('home.html')

@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("home"))

@app.route('/Shop')
def shop():
    return render_template('shop.html')

@app.route('/Contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        subject = request.form['subject']
        message = request.form['message']

        msg = Message(subject=subject, 
                      sender=email,
                      recipients=['anibal.rodriguez@sticky-link.com'])
        msg.body = f'From: {name} <{email}>\n\n{message}'
        mail.send(msg)
        return redirect(url_for('contact')) 
    else:
        return render_template('contact.html')
    
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=False)
