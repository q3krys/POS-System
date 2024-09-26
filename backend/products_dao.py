#products_dao.py
from sql_connection import get_sql_connection

def get_all_products(connection):
    cursor = connection.cursor() #creates cursor object which enables the execution of SQL queries
    query = "SELECT products.product_id, products.name, products.price, products.product_type FROM products" #the query to get all products
    cursor.execute(query)
    response = []
    for (product_id, name, price, product_type) in cursor:
        response.append({
            'product_id': product_id,
            'name': name,
            'price': price,
            'product_type': product_type,
        })
    return response


