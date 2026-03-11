import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function StudentLesson() {

  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, "") : "";
  useEffect(() => {
    fetch(`${API_BASE}/api/student/lessons/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.json())
      .then(data => setLesson(data.data));
  }, [id]);

  if(!lesson) return <div>Loading...</div>;

  return (
    <div>
      <h2>{lesson.title}</h2>
      <p>{lesson.description}</p>

      {lesson.contents.map(c => {

        if(c.type === "image")
          return <img key={c.id} src={c.url} width="400"/>

        if(c.type === "video")
          return <video key={c.id} controls width="600" src={c.url}></video>

        if(c.type === "audio")
          return <audio key={c.id} controls src={c.url}></audio>

        if(c.type === "document")
          return <a key={c.id} href={c.url}>Open Document</a>

        return null;
      })}
    </div>
  );
}