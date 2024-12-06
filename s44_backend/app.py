from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, unset_jwt_cookies, get_jwt
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient
from bson.objectid import ObjectId
import json
from dotenv import load_dotenv
import os
import hashlib

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

# MongoDB Configuration
mongo_client = MongoClient(os.getenv('MONGO_CONNECTION_STRING'))
db = mongo_client[os.getenv('DB_NAME')]

def convert_to_html(content_json):
    # based on rich text editor convert to HTML
    return content_json

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dictionary."""
    doc['_id'] = str(doc['_id'])
    return doc

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"msg": "Missing username or password"}), 400
    
    try:
        user = db.users.find_one({"username": data['username']})
        
        if user:
            hashed_password = hashlib.sha512(data['password'].encode('utf-8')).hexdigest()
            if user['password'] == hashed_password:
                access_token = create_access_token(identity=user['username'])
                return jsonify(access_token=access_token)
        return jsonify({"msg": "Bad username or password"}), 401
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    try:
        contents = list(db.content.find({"page_type": "dashboard"}).sort("order_id"))
        contents = [serialize_doc(content) for content in contents]
        
        return jsonify({
            "logged_in_as": get_jwt_identity(),
            "contents": contents
        }), 200
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/summary', methods=['GET'])
@jwt_required()
def summary():
    try:
        contents = list(db.content.find({"page_type": "summary"}).sort("order_id"))
        charts = list(db.charts.find({"page_type": "summary"}).sort("order_id"))
        
        contents = [serialize_doc(content) for content in contents]
        charts = [serialize_doc(chart) for chart in charts]
        
        items = []
        content_idx = 0
        chart_idx = 0
        
        while content_idx < len(contents) or chart_idx < len(charts):
            if content_idx < len(contents) and (chart_idx >= len(charts) or 
                contents[content_idx]['order_id'] <= charts[chart_idx]['order_id']):
                items.append({
                    'type': 'content',
                    'data': contents[content_idx]
                })
                content_idx += 1
            else:
                items.append({
                    'type': 'chart',
                    'data': charts[chart_idx]
                })
                chart_idx += 1
        
        return jsonify({
            "items": items
        }), 200
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/reports', methods=['GET'])
@jwt_required()
def reports():
    try:
        contents = list(db.content.find({"page_type": "reports"}).sort("order_id"))
        charts = list(db.charts.find({"page_type": "reports"}).sort("order_id"))
        
        contents = [serialize_doc(content) for content in contents]
        charts = [serialize_doc(chart) for chart in charts]
        
        items = []
        content_idx = 0
        chart_idx = 0
        
        while content_idx < len(contents) or chart_idx < len(charts):
            if content_idx < len(contents) and (chart_idx >= len(charts) or 
                contents[content_idx]['order_id'] <= charts[chart_idx]['order_id']):
                items.append({
                    'type': 'content',
                    'data': contents[content_idx]
                })
                content_idx += 1
            else:
                items.append({
                    'type': 'chart',
                    'data': charts[chart_idx]
                })
                chart_idx += 1
        
        return jsonify({
            "items": items
        }), 200
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/')
def home():
    return jsonify({"msg": "Welcome to S44 Backend!"})

# Admin Routes
@app.route('/admin/contents/<page_type>', methods=['GET'])
@jwt_required()
def get_contents(page_type):
    try:
        contents = list(db.content.find({"page_type": page_type}).sort("order_id"))
        contents = [serialize_doc(content) for content in contents]
        return jsonify(contents)
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/admin/charts/<page_type>', methods=['GET'])
@jwt_required()
def get_charts(page_type):
    try:
        charts = list(db.charts.find({"page_type": page_type}).sort("order_id"))
        charts = [serialize_doc(chart) for chart in charts]
        return jsonify(charts)
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/admin/add_content', methods=['POST'])
@jwt_required()
def add_content():
    data = request.get_json()
    page_type = data.get('page_type')
    content = data.get('content')
    order_id = data.get('order_id')
    
    if not all([page_type, content, order_id]):
        return jsonify({"msg": "Missing required fields"}), 400
    
    try:
        html_content = convert_to_html(content)
        db.content.insert_one({
            "page_type": page_type,
            "content": content,
            "html_content": html_content,
            "order_id": order_id
        })
        return jsonify({"msg": "Content added successfully"}), 201
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/admin/add_chart', methods=['POST'])
@jwt_required()
def add_chart():
    data = request.get_json()
    page_type = data.get('page_type')
    chart_type = data.get('chart_type')
    chart_data = data.get('chart_data')
    order_id = data.get('order_id')
    
    if not all([page_type, chart_type, chart_data, order_id]):
        return jsonify({"msg": "Missing required fields"}), 400
    
    try:
        db.charts.insert_one({
            "page_type": page_type,
            "chart_type": chart_type,
            "chart_data": json.dumps(chart_data),
            "order_id": order_id
        })
        return jsonify({"msg": "Chart added successfully"}), 201
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/admin/content/<id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_content(id):
    try:
        if request.method == 'DELETE':
            db.content.delete_one({"_id": ObjectId(id)})
            return jsonify({"msg": "Content deleted successfully"})
            
        data = request.get_json()
        content = data.get('content')
        page_type = data.get('page_type')
        order_id = data.get('order_id')
        
        if not all([content, page_type, order_id]):
            return jsonify({"msg": "Missing required fields"}), 400
            
        html_content = convert_to_html(content)
        db.content.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "content": content,
                "html_content": html_content,
                "page_type": page_type,
                "order_id": order_id
            }}
        )
        return jsonify({"msg": "Content updated successfully"})
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

@app.route('/admin/chart/<id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_chart(id):
    try:
        if request.method == 'DELETE':
            db.charts.delete_one({"_id": ObjectId(id)})
            return jsonify({"msg": "Chart deleted successfully"})
            
        data = request.get_json()
        chart_type = data.get('chart_type')
        chart_data = data.get('chart_data')
        page_type = data.get('page_type')
        order_id = data.get('order_id')
        
        if not all([chart_type, chart_data, page_type, order_id]):
            return jsonify({"msg": "Missing required fields"}), 400
            
        db.charts.update_one(
            {"_id": ObjectId(id)},
            {"$set": {
                "chart_type": chart_type,
                "chart_data": json.dumps(chart_data),
                "page_type": page_type,
                "order_id": order_id
            }}
        )
        return jsonify({"msg": "Chart updated successfully"})
    except Exception as e:
        print(f"Database error: {e}")
        return jsonify({"msg": "Internal server error"}), 500

if __name__ == '__main__':
    try:
        print(f"Initializing database: {os.getenv('DB_NAME')}")
        
        print("Creating indexes...")
        db.users.create_index("username", unique=True)
        db.content.create_index([("page_type", 1), ("order_id", 1)], unique=True)
        db.charts.create_index([("page_type", 1), ("order_id", 1)], unique=True)
        
        print("Checking for default user...")
        if not db.users.find_one({"username": "sumanth"}):
            db.users.insert_one({
                "username": "sumanth",
                "password": "f6a019e1dd70d44aa912a2d0fad691997a2107b42ba738184736cf684a87cc901091265012e46d4abb8d3847dd661e7b9d5ba4c92d334d87cd2e3661cc3092f5"
            })
            print("Default user created successfully")
        
        print("Database initialization completed successfully")
            
    except Exception as e:
        print(f"General error during database initialization: {e}")
        
    app.run(host="0.0.0.0", port=3000)