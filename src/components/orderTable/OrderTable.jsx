import "./orderTable.css";

const OrderTable = ({ order }) => {

  // Calculate total price of all items in the order
  const totalPrice = order.purchaseItem.reduce((acc, item) => {
    return acc + item.price * item.quantity;
  }, 0);
  return (
    <>
      <div className="order-box">
        {/* Order date display */}
        <h2>Ordered On:- {order.date}</h2>
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {order.purchaseItem.map((purchaseItem) => (
                <tr key={purchaseItem.productId}>
                  <td>
                    {purchaseItem.title.length > 30
                      ? purchaseItem.title.slice(0, 30) + "...."
                      : purchaseItem.title}
                  </td>
                  <td>₹ {purchaseItem.price}</td>
                  <td>{purchaseItem.quantity}</td>
                  <td>₹ {purchaseItem.price * purchaseItem.quantity}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="3"></td>
                <td>₹ {totalPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default OrderTable;
