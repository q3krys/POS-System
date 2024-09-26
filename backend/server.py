#server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from sql_connection import get_sql_connection
import products_dao
import orders_dao

app = Flask(__name__)
CORS(app)

connection = get_sql_connection()

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route('/getProducts', methods=['GET'])
def get_products():
    response = products_dao.get_all_products(connection)
    response = jsonify(response)
    return response

@app.route('/getAllOrders', methods=['GET'])
def get_all_orders():
    response = orders_dao.get_all_orders(connection)
    response = jsonify(response)
    return response

@app.route('/createOrder', methods=['POST'])
def create_order():
    request_payload = request.get_json()
    order_id = orders_dao.create_order(connection, request_payload)
    response = jsonify({
        'order_id': order_id
    })
    return response

if __name__ == "__main__":
    print("Starting Server")
    app.run(host='127.0.0.1', port=5000, debug=True)
