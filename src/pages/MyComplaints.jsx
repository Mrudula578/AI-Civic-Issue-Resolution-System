import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api";
import "./Pages.css";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyComplaints();
      setComplaints(response.complaints || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(/_/g, '-');
  };

  return (
    <div className="page-container complaints-page">

      <div className="complaints-header">
        <div>
          <h1>My Complaints</h1>
          <p>Track the status of your reported civic issues.</p>
        </div>

        <button className="form-btn" onClick={() => navigate("/report")}>
          + Report New Issue
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading complaints...</div>}

      {!loading && complaints.length === 0 && (
        <div className="no-complaints">
          <p>You haven't reported any issues yet.</p>
          <button className="form-btn" onClick={() => navigate("/report")}>
            Report Your First Issue
          </button>
        </div>
      )}

      <div className="complaints-list">
        {complaints.map((complaint) => (
          <div className="complaint-card" key={complaint.id}>

            <div className="complaint-info">
              <span className="complaint-id">
                {complaint.id.substring(0, 8).toUpperCase()}
              </span>

              <h2>{complaint.title}</h2>

              <p>
                Category: {complaint.category?.name || 'N/A'}
              </p>

              <p>
                Location: {complaint.location}
              </p>

              <p>
                Reported on: {formatDate(complaint.createdAt)}
              </p>

              {complaint.description && (
                <p className="complaint-description">
                  {complaint.description.substring(0, 100)}...
                </p>
              )}
            </div>

            <div className="complaint-status">
              <span className={`status ${getStatusClass(complaint.status)}`}>
                {complaint.status.replace(/_/g, ' ')}
              </span>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

export default MyComplaints;