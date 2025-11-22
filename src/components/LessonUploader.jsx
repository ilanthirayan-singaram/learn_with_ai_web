// File: LessonUploader.jsx
import React, { useState, useMemo } from 'react';
import axios from 'axios';

function humanFileSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  const thresh = 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';
  const units = ['KB','MB','GB','TB'];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + ' ' + units[u];
}

export default function LessonUploader({ apiBaseUrl, token }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [images, setImages] = useState([]);      // File objects
  const [documents, setDocuments] = useState([]);
  const [audios, setAudios] = useState([]);
  const [videos, setVideos] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0); // 0..100
  const [statusMessage, setStatusMessage] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // helper: handle file selection for a type
  const onFilesSelected = (filesList, setter) => {
    const arr = Array.from(filesList || []);
    setter(prev => [...prev, ...arr]);
  };

  const removeFile = (index, arrSetter) => {
    arrSetter(prev => prev.filter((_, i) => i !== index));
  };

  // compute total bytes for proportional progress
  const totalBytes = useMemo(() => {
    const sum = (arr) => arr.reduce((s, f) => s + (f.size || 0), 0);
    return sum(images) + sum(documents) + sum(audios) + sum(videos);
  }, [images, documents, audios, videos]);

  // estimated per-file progress mapping (derived from overall sent bytes)
  // We will compute a "virtual" per-file progress based on bytes proportion.
  function estimatePerFileProgress(sentBytes) {
    const map = new Map();
    let offset = 0;

    const push = (arr, keyPrefix) => {
      arr.forEach((f, idx) => {
        const start = offset;
        const end = offset + (f.size || 0);
        offset = end;
        const fileSent = Math.max(0, Math.min(f.size || 0, sentBytes - start));
        const pct = (f.size ? (fileSent / f.size) : 0) * 100;
        map.set(`${keyPrefix}_${idx}`, Math.round(pct));
      });
    };

    push(images, 'image');
    push(documents, 'doc');
    push(audios, 'audio');
    push(videos, 'video');

    return map; // keys are like 'image_0' -> percentage 0..100
  }

  async function uploadAll() {
    setStatusMessage(null);
    setErrorMsg(null);
    setServerResponse(null);

    if (!title.trim() || !subject.trim()) {
      setErrorMsg('Title and Subject are required.');
      return;
    }
    if (totalBytes === 0) {
      setErrorMsg('Attach at least one file.');
      return;
    }

    const form = new FormData();
    form.append('title', title);
    form.append('subject', subject);
    form.append('description', description || '');

    // append arrays with [] names
    images.forEach(f => form.append('images[]', f));
    documents.forEach(f => form.append('documents[]', f));
    audios.forEach(f => form.append('audios[]', f));
    videos.forEach(f => form.append('videos[]', f));

    try {
      setUploading(true);
      setOverallProgress(0);

      const url = `${apiBaseUrl.replace(/\/$/, '')}/public/api/teacher/lessons`;

      const resp = await axios.post(url, form, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // DON'T set Content-Type header - let browser set boundary
        },
        onUploadProgress: (progressEvent) => {
          // progressEvent.loaded, progressEvent.total may include extra form overhead.
          // Use loaded bytes to compute overall % relative to totalBytes (good UX).
          const loaded = progressEvent.loaded;
          const pct = totalBytes > 0 ? Math.min(100, Math.round((loaded / (totalBytes + 1)) * 100)) : 0;
          setOverallProgress(pct);

          // optional: compute estimated per-file progress
          // const perFileMap = estimatePerFileProgress(loaded);
          // you can store/use it if you want to display per-file progress
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 0, // no timeout for big uploads (adjust if you prefer)
      });

      setServerResponse(resp.data);
      setStatusMessage('Upload successful');
      setImages([]); setDocuments([]); setAudios([]); setVideos([]);
    } catch (err) {
      console.error('Upload error', err);
      if (err.response?.data) {
        setErrorMsg(`Server: ${JSON.stringify(err.response.data)}`);
      } else {
        setErrorMsg(err.message || 'Upload failed');
      }
    } finally {
      setUploading(false);
      setOverallProgress(0);
    }
  }

  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:16}}>
      <h3>Lesson Upload (React)</h3>

      <div style={{marginBottom:12}}>
        <label>Title *</label><br/>
        <input value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:8}} />
      </div>

      <div style={{marginBottom:12}}>
        <label>Subject *</label><br/>
        <input value={subject} onChange={e=>setSubject(e.target.value)} style={{width:'100%', padding:8}} />
      </div>

      <div style={{marginBottom:12}}>
        <label>Description</label><br/>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} style={{width:'100%', padding:8}} />
      </div>

      {/* File pickers */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        <div>
          <label>Images (jpg/png/webp)</label><br/>
          <input type="file" accept="image/*" multiple onChange={e => onFilesSelected(e.target.files, setImages)} disabled={uploading} />
          <div>{images.map((f, i) => (
            <div key={i} style={{display:'flex', alignItems:'center', marginTop:8}}>
              <img src={URL.createObjectURL(f)} alt="" style={{width:64,height:64,objectFit:'cover',marginRight:8}} />
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{f.name}</div>
                <div style={{fontSize:12}}>{humanFileSize(f.size)}</div>
              </div>
              <button onClick={()=>removeFile(i, setImages)} disabled={uploading}>Remove</button>
            </div>
          ))}</div>
        </div>

        <div>
          <label>Documents (pdf/doc/docx/txt)</label><br/>
          <input type="file" accept=".pdf,.doc,.docx,.txt" multiple onChange={e => onFilesSelected(e.target.files, setDocuments)} disabled={uploading} />
          <div>{documents.map((f,i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
              <div>{f.name} <small>({humanFileSize(f.size)})</small></div>
              <button onClick={()=>removeFile(i, setDocuments)} disabled={uploading}>Remove</button>
            </div>
          ))}</div>
        </div>

        <div>
          <label>Audios (mp3/wav)</label><br/>
          <input type="file" accept="audio/*" multiple onChange={e => onFilesSelected(e.target.files, setAudios)} disabled={uploading} />
          <div>{audios.map((f,i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
              <div>{f.name} <small>({humanFileSize(f.size)})</small></div>
              <button onClick={()=>removeFile(i, setAudios)} disabled={uploading}>Remove</button>
            </div>
          ))}</div>
        </div>

        <div>
          <label>Videos (mp4,mov,avi,mkv)</label><br/>
          <input type="file" accept="video/*" multiple onChange={e => onFilesSelected(e.target.files, setVideos)} disabled={uploading} />
          <div>{videos.map((f,i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
              <div>{f.name} <small>({humanFileSize(f.size)})</small></div>
              <button onClick={()=>removeFile(i, setVideos)} disabled={uploading}>Remove</button>
            </div>
          ))}</div>
        </div>
      </div>

      {/* Progress and actions */}
      <div style={{marginTop:16}}>
        {uploading && <div style={{marginBottom:8}}>Uploading: {overallProgress}%</div>}
        {uploading && <div style={{height:8, background:'#eee'}}><div style={{width:`${overallProgress}%`, height:'100%', background:'#4caf50'}}/></div>}
        {statusMessage && <div style={{color:'green', marginTop:8}}>{statusMessage}</div>}
        {errorMsg && <div style={{color:'red', marginTop:8}}>{errorMsg}</div>}

        <div style={{marginTop:12}}>
          <button onClick={uploadAll} disabled={uploading} style={{padding:'10px 18px', marginRight:8}}>Upload</button>
          <button onClick={() => { setImages([]); setDocuments([]); setAudios([]); setVideos([]); }} disabled={uploading} style={{padding:'10px 18px'}}>Clear</button>
        </div>

        {serverResponse && <pre style={{marginTop:12, background:'#f7f7f7', padding:12, whiteSpace:'pre-wrap'}}>{JSON.stringify(serverResponse, null, 2)}</pre>}
      </div>
    </div>
  );
}
