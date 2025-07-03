import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Homepage.css';

const API_URL = 'https://localhost:44314/api/videos';

export default function HomepageVideos() {
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading, isError } = useQuery({
    queryKey: ['videos'],
    queryFn: () => axios.get(API_URL).then(res => res.data),
  });

  const [editedVideos, setEditedVideos] = useState({});
  const [editMode, setEditMode] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const paginatedVideos = videos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const mutation = useMutation({
    mutationFn: (updatedVideo) =>
      axios.put(`${API_URL}/${updatedVideo.id}`, updatedVideo),
    onSuccess: (_, updatedVideo) => {
      queryClient.invalidateQueries(['videos']);
      toast.success('Changes saved!');
      const idx = videos.findIndex(v => v.id === updatedVideo.id);
      setEditedVideos(prev => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
      setEditMode(prev => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    },
    onError: () => toast.error('Failed to save changes.'),
  });

  const handleEdit = (index, field, value) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setEditedVideos(prev => ({
      ...prev,
      [globalIndex]: {
        ...videos[globalIndex],
        ...prev[globalIndex],
        [field]: value,
      },
    }));
  };

  const handleSave = (index) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    if (!editedVideos[globalIndex]) return;
    mutation.mutate(editedVideos[globalIndex]);
  };

  const toggleEdit = (index) => {
    const globalIndex = (currentPage - 1) * itemsPerPage + index;
    setEditMode(prev => ({ ...prev, [globalIndex]: !prev[globalIndex] }));
  };

  if (isLoading) return <div>Loading videos...</div>;
  if (isError) return <div>Error loading videos.</div>;

  return (
    <div className="homepage-container">
      <ToastContainer position="top-right" />
      <h2>Homepage Videos</h2>
      <table className="video-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Summary</th>
            <th>Facebook</th>
            <th>Twitter</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedVideos.map((video, index) => {
            const globalIndex = (currentPage - 1) * itemsPerPage + index;
            const edited = editedVideos[globalIndex] || {};
            const isEditing = editMode[globalIndex];

            return (
              <tr key={video.id}>
                <td>
                  {isEditing ? (
                    <ReactQuill
                      theme="snow"
                      value={edited.title ?? video.title}
                      onChange={(value) => handleEdit(index, 'title', value)}
                      modules={{ toolbar: false }}
                      formats={['bold', 'italic', 'underline', 'strike', 'link']}
                      className="title-quill"
                    />
                  ) : (
                    <p className="font-size">
                      <span dangerouslySetInnerHTML={{ __html: edited.title ?? video.title }} />
                    </p>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <ReactQuill
                      theme="snow"
                      value={edited.summary ?? video.summary}
                      onChange={(value) => handleEdit(index, 'summary', value)}
                    />
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: edited.summary ?? video.summary }} />
                  )}
                </td>
                <td>
                  <a href={video.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
                </td>
                <td>
                  <a href={video.twitter} target="_blank" rel="noopener noreferrer">Twitter</a>
                </td>
                <td>
                  <button onClick={() => toggleEdit(index)}>
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                  {isEditing && (
                    <button onClick={() => handleSave(index)} disabled={mutation.isLoading}>
                      Save
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination-controls">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span className='pagination'>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}
