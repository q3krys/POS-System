#sql_connection.py
import datetime 
import mysql.connector #Running the sql connection in a separate file and calling it makes the code more reusable + stops me having to copy-paste the code between files

__cnx = None #Indicator of whether or not there is a current connection or not, cnx was the default variable name used in the mySQL documentation's boilerplate code

def get_sql_connection(): #Function to establish connection to database via mySQL - will be reused in all other backend files
    global __cnx #Establishing connection as a global variable to ensure that only one connection is open at a time
    print("Establishing database connection...") #Indication to ensure that this function is working fine

    if __cnx is None: #Will not establish connection if one is already present
         __cnx = mysql.connector.connect(
            user='root',
            password='password',
            host='localhost',
            database='pos',
            )
        
    return __cnx