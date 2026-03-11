import { useEffect, useState } from "react";

export default function StudentDashboard() {

  const [lessons, setLessons] = useState([]);
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");

  window.location.href = "/login";
};

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";
  useEffect(() => {
    fetch(`${API_BASE}/api/student/lessons`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => {
        setLessons(data.data);
      });
  }, []);

  return (
    <div>
<button onClick={logout}>Logout</button>

      <h2>Available Lessons</h2>

      {lessons.map(l => (
        <div key={l.id} style={{border:"1px solid #ccc", margin:"10px", padding:"10px"}}>
          <h3>{l.title}</h3>
          <p>{l.subject}</p>

          <a href={"/student/lesson/" + l.id}>
            Open Lesson
          </a>
        </div>
      ))}
    </div>
  );
}