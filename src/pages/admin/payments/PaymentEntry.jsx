import { useState } from "react";
import { apiFetch } from "../../../api/apiClient";
import MainLayout from "../../../layouts/MainLayout";


function PaymentEntry() {

  const [studentId, setStudentId] = useState("");
  const [summary, setSummary] = useState(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");

  const loadSummary = async (studentId) => {

  const token = localStorage.getItem("token");

  const res = await apiFetch(
    `/api/v1/admin/student/${studentId}/financial-summary`,
    {},
    token
  );

  setSummary(res.data);
};

const savePayment = async () => {

  const token = localStorage.getItem("token");

  const data = {
    student_id: studentId,
    
    amount_paid: amount,
    payment_method: method,
    payment_date: new Date().toISOString().slice(0,10)
  };

  await apiFetch(
    "/api/payments",
    {
      method: "POST",
      body: JSON.stringify(data)
    },
    token
  );

  alert("Payment saved");

};

  return (
    <MainLayout>

      <h2 className="text-xl font-bold mb-4">Record Payment</h2>

      <div className="space-y-4">

        <div>
          <label>Student ID</label>
          <input
            className="border p-2 w-full"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
        </div>

        <div>
          <label>Amount</label>
          <input
            className="border p-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label>Payment Method</label>
          <select
            className="border p-2 w-full"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank</option>
          </select>
        </div>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={savePayment}
        >
          Save Payment
        </button>

      </div>

    </MainLayout>
  );
}

export default PaymentEntry;