document.addEventListener("DOMContentLoaded", function () {
  const orderTableBody = document.getElementById("order-table-body");

  fetch("http://127.0.0.1:5000/getAllOrders")
      .then(response => response.json())
      .then(orders => {
          displayOrders(orders);
      })
      .catch(error => console.error("Error fetching orders:", error));

  function displayOrders(orders) {
      orderTableBody.innerHTML = "";

      orders.forEach(order => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${order.order_id}</td>
              <td>£${order.total.toFixed(2)}</td>
              <td>${order.datetime}</td>
          `;
          orderTableBody.appendChild(row);
      });
  }
});
