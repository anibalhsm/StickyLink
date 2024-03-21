How to Connect:

# SSH command to connect to your EC2 instance

# Pull the latest changes from the repository
git pull


# Activating the virtual environment
source flaskenv/bin/activate

# Initialize the migrations directory
flask db init

# Generate a migration after model changes
flask db migrate -m "migration message"

# Apply the migrations to the database
flask db upgrade

# Promote a user to admin
flask promote-to-admin <username>

# Starting Gunicorn with 4 workers on port 8000
gunicorn -w 4 app:app -b 0.0.0.0:8000

# Kill Gunicorn processes
pkill gunicorn
