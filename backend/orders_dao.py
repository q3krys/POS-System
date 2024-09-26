#orders_dao.py
from datetime import datetime
from sql_connection import get_sql_connection

def create_order(connection, order):
    cursor = connection.cursor()

    # Calculates total price for order_details table
    total_price = sum(float(item['total']) for item in order['order_details'])

    # Orders Table
    # SQL Query to insert values into the table
    order_query = ("INSERT INTO orders "
                   "(total, datetime) "
                   "VALUES (%s, %s)")
    # Creating a tuple to store the total_price and datetime
    order_data = (total_price, datetime.now())
    cursor.execute(order_query, order_data)
    order_id = cursor.lastrowid
#-------------------------------------------------------------------#
    # Order Details Table
    # SQL Query to insert values into the table
    order_details_query = ("INSERT INTO order_details "
                        "(order_id, product_id, quantity, total_price) "
                        "VALUES (%s, %s, %s, %s)")
#                                   ^ Placeholder Values

# Creating an empty, mutable list to store values in
    order_details_data = []
    for order_detail_record in order['order_details']:
        product_total = float(order_detail_record['total'])
        order_details_data.append([
            order_id,
            int(order_detail_record['product_id']),
            int(order_detail_record['quantity']),
            product_total
        ])

    cursor.executemany(order_details_query, order_details_data)
    connection.commit()

    return order_id

def get_order_details(connection, order_id):
    cursor = connection.cursor()
    # Query to select all values from the relevant tables
    # LEFT JOIN to get matching records from products table
    query = ("SELECT order_details.order_id, order_details.quantity, order_details.total_price, "
             "products.name, products.price "
             "FROM order_details "
             "LEFT JOIN products ON order_details.product_id = products.product_id "
             "WHERE order_details.order_id = %s")
#                                           ^^^^^ - Placeholder Value
    # Creates a tuple of a single item, hence the comma and no followup
    # Tuple is then used in the execute query below
    data = (order_id, )

    cursor.execute(query, data)

    records = []
    for (order_id, quantity, total_price, name, price) in cursor:
        records.append({
            'order_id': order_id,
            'quantity': quantity,
            'total': total_price,
            'name': name,
            'price': price
        })

    cursor.close()

    return records

def get_all_orders(connection):
    cursor = connection.cursor()

    query = ("SELECT order_id, total, datetime FROM orders")
    cursor.execute(query)

    orders = []
    for (order_id, total, datetime) in cursor:
        orders.append({
            'order_id': order_id,
            'total': total,
            'datetime': datetime.strftime("%Y-%m-%d %H:%M:%S")  # Format datetime as string
        })

    cursor.close()

    print("Orders:", orders)  # Add this line for debugging

    return orders
