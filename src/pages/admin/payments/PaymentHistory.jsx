import { useEffect, useState } from "react";
import { apiFetch } from "../../../api/apiClient";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../layouts/MainLayout";

function PaymentHistory() {

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const navigate = useNavigate();


  useEffect(() => { loadPayments();  }, []);

const openReceipt = (payment) => {
  setSelectedPayment(payment);
  setShowReceipt(true);
};

  const loadPayments = async () => {
    try {
    const token = localStorage.getItem("token");

      const res = await apiFetch("/api/payments",{ method: "GET" },
        token );

      setPayments(res.data || []);
      setLoading(false);

    } catch (err) {
      console.error("Failed to load payments", err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading payments...</div>;
  }
 return (

    <MainLayout>

      <h2 className="text-xl font-bold mb-4">Payment History</h2>

      <table className="table-auto w-full border">

        <thead>
          <tr className="bg-gray-100">
            <th>Date</th>
            <th>Student</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Receipt</th>
          </tr>
        </thead>

        <tbody>

          {payments.map((p) => (

            <tr key={p.id}>

              <td>{p.payment_date}</td>

              <td>{p.student_name || p.student_id}</td>

              <td>₹{p.amount_paid}</td>

              <td>{p.payment_method}</td>

              <td>
                <button onClick={() => openReceipt(p)}>  View</button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>
{showReceipt && selectedPayment && (

<div className="fixed top-1/4 left-1/3 bg-white p-6 border shadow-lg">

<h3 className="text-lg font-bold mb-2">Payment Receipt</h3>

<p><b>Student:</b> {selectedPayment.student_name}</p>
<p><b>Amount:</b> ₹{selectedPayment.amount_paid}</p>
<p><b>Method:</b> {selectedPayment.payment_method}</p>
<p><b>Date:</b> {selectedPayment.payment_date}</p>

<div className="mt-4 flex gap-2">

<button
onClick={() => window.print()}
className="bg-blue-500 text-white px-3 py-1 rounded"
>
Print
</button>

<button
onClick={() => setShowReceipt(false)}
className="bg-gray-500 text-white px-3 py-1 rounded"
>
Close
</button>

</div>

</div>

)}
    </MainLayout>

  );
}

export default PaymentHistory;