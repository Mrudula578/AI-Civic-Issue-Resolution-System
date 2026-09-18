import "./Pages.css";

function ReportIssue() {
  return (
    <div className="page-container">
      <div className="form-card report-card">
        <h1>Report a Civic Issue</h1>

        <p>
          Provide the details of the issue so the concerned authority
          can review and resolve it.
        </p>

        <form>

          <label>Issue Title</label>
          <input
            type="text"
            placeholder="Example: Pothole near college"
          />

          <label>Category</label>
          <select>
            <option value="">Select issue category</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage</option>
            <option value="water">Water Leakage</option>
            <option value="streetlight">Streetlight</option>
            <option value="drainage">Drainage</option>
            <option value="other">Other</option>
          </select>

          <label>Description</label>
          <textarea
            placeholder="Describe the issue in detail"
            rows="5"
          ></textarea>

          <label>Location</label>
          <input
            type="text"
            placeholder="Enter the issue location"
          />

          <label>Upload Image</label>
          <input
            type="file"
            accept="image/*"
          />

          <button type="submit" className="form-btn">
            Submit Complaint
          </button>

        </form>
      </div>
    </div>
  );
}

export default ReportIssue;