import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api";
import "./Pages.css";

function ReportIssue() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    location: "",
  });
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.categories || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError("Maximum 3 images allowed");
      return;
    }
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.categoryId || !formData.location) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const response = await apiClient.submitComplaint(formData, files);
      setSuccessMessage("Complaint submitted successfully! Redirecting...");
      
      setTimeout(() => {
        navigate("/complaints");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit complaint");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card report-card">
        <h1>Report a Civic Issue</h1>

        <p>
          Provide the details of the issue so the concerned authority
          can review and resolve it.
        </p>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit}>

          <label>Issue Title *</label>
          <input
            type="text"
            name="title"
            placeholder="Example: Pothole near college"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <label>Category *</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select issue category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label>Description *</label>
          <textarea
            name="description"
            placeholder="Describe the issue in detail"
            value={formData.description}
            onChange={handleInputChange}
            rows="5"
            required
          ></textarea>

          <label>Location *</label>
          <input
            type="text"
            name="location"
            placeholder="Enter the issue location"
            value={formData.location}
            onChange={handleInputChange}
            required
          />

          <label>Upload Images (Max 3)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
          {files.length > 0 && (
            <p className="file-info">{files.length} file(s) selected</p>
          )}

          <button type="submit" className="form-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default ReportIssue;