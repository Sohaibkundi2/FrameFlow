"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const maxFileSize = 60 * 1024 * 1024; // 60 MB

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please select a video file.");
      return;
    }

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    if (file.size > maxFileSize) {
      setError("File size is too large. Max 60MB allowed.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("originalSize", file.size.toString());

      const response = await axios.post("/api/video-upload", formData);

      if (!response || response.status !== 200) {
        setError("Something went wrong during upload. Try again.");
        return;
      }

      // Redirect on success
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Upload a Video</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          className="w-full border p-2 rounded"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          className="w-full border p-2 rounded"
        />

        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}

export default VideoUpload;
