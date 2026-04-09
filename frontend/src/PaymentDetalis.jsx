import React, { useState } from "react";

function PaymentDetails({ onConfirm }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handlePayment = () => {
    // Simulate payment processing
    alert("Payment processed successfully!");
    onConfirm(); // Call the confirmation function
  };

  return (
    <div>
      <h3>Payment Information</h3>
      <label>
        Card Number:
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
        />
      </label>
      <label>
        Expiry Date:
        <input
          type="text"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </label>
      <label>
        CVV:
        <input
          type="text"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
        />
      </label>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
}

export default PaymentDetails;
