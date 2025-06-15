import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/transactions')
      .then(res => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching transactions:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Transaction Records</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              <th className="py-2 px-4">Transaction ID</th>
              <th className="py-2 px-4">Customer</th>
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Transaction Type</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Payment Method</th>
              <th className="py-2 px-4">Payment Status</th>
              <th className="py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.transaction_id} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{tx.transaction_id}</td>
                <td className="py-2 px-4">{tx.customer_name}</td>
                <td className="py-2 px-4">{tx.order_id}</td>
                <td className="py-2 px-4">{tx.transaction_type}</td>
                <td className="py-2 px-4">₱{tx.amount.toFixed(2)}</td>
                <td className="py-2 px-4">{tx.transaction_status}</td>
                <td className="py-2 px-4">{tx.payment_method}</td>
                <td className="py-2 px-4">{tx.payment_status}</td>
                <td className="py-2 px-4">{new Date(tx.transaction_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
