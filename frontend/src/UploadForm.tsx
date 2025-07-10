import { useRef, useState } from "react";
import { supabase } from "./supabase";
import { api } from "./utils/api";

const BUCKET_NAME = import.meta.env.VITE_SUPABASE_BUCKET_NAME;
interface UploadedFile {
  name: string;
  url: string;
  path: string;
}

export default function UploadForm() {
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setUploading(true);
    setError(null);

    const user = await supabase.auth.getUser();
    const catalogPath = user.data.user?.id;
    const files = Array.from(e.target.files);

    const uploadTasks = files.map(async (file) => {
      const ext = file.name.split(".").pop();
      const filePath = `${catalogPath}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        return { error: `Ошибка загрузки файла: ${file.name}` };
      }

      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 60 * 60);

      if (urlError || !data?.signedUrl) {
        return { error: `Ошибка получения ссылки для файла: ${file.name}` };
      }

      return { name: file.name, url: data.signedUrl, path: filePath };
    });

    const uploadedFiles: UploadedFile[] = [];
    const results = await Promise.allSettled(uploadTasks);

    for (const res of results) {
      if (res.status === "fulfilled" && !("error" in res.value)) {
        uploadedFiles.push(res.value as UploadedFile);
      }
    }

    setUploaded((prev) => [...prev, ...uploadedFiles]);
    setUploading(false);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = async (idx: number) => {
    setUploaded((prev) => prev.filter((_, i) => i !== idx));
    supabase.storage.from(BUCKET_NAME).remove([uploaded[idx].path]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/upload", {
        message,
        files: uploaded.map((file) => ({
          name: file.name,
          path: file.path,
          url: "",
        })),
      });

      setMessage("");
      setUploaded([]);
    } catch (err) {
      setError("Ошибка отправки формы");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ maxWidth: 400, margin: "2rem auto" }}
    >
      <h2>Upload files to Supabase</h2>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        ref={fileInputRef}
        disabled={uploading || submitting}
      />
      <div style={{ margin: "1rem 0" }}>
        {uploaded.length > 0 && (
          <div>
            <strong>Uploaded files:</strong>
            <ul style={{ paddingLeft: 0 }}>
              {uploaded.map((file, idx) => (
                <li
                  key={file.url}
                  style={{
                    position: "relative",
                    listStyle: "none",
                    marginBottom: 8,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      position: "absolute",
                      left: -20,
                      top: 0,
                      color: "red",
                      border: "none",
                      background: "transparent",
                      fontWeight: "bold",
                      fontSize: 18,
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveFile(idx)}
                    aria-label="Удалить файл"
                  >
                    ×
                  </button>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                  {file.url.match(
                    /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i
                  ) && (
                    <div>
                      <img
                        src={file.url}
                        alt={file.name}
                        style={{ maxWidth: 100, marginTop: 4 }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <textarea
        placeholder="Введите сообщение"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        style={{ width: "100%" }}
        disabled={submitting}
      />
      <button type="submit" disabled={submitting || uploaded.length === 0}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
