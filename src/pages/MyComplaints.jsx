import "./Pages.css";

function MyComplaints() {
  const complaints = [
    {
      id: "CR001",
      title: "Pothole near college",
      category: "Pothole",
      status: "Pending",
      date: "18 Sep 2026",
    },
    {
      id: "CR002",
      title: "Streetlight not working",
      category: "Streetlight",
      status: "In Progress",
      date: "15 Sep 2026",
    },
    {
      id: "CR003",
      title: "Garbage accumulation",
      category: "Garbage",
      status: "Resolved",
      date: "10 Sep 2026",
    },
  ];

  return (
    <div className="page-container complaints-page">

      <div className="complaints-header">
        <div>
          <h1>My Complaints</h1>
          <p>Track the status of your reported civic issues.</p>
        </div>

        <button className="form-btn">
          + Report New Issue
        </button>
      </div>

      <div className="complaints-list">

        {complaints.map((complaint) => (
          <div className="complaint-card" key={complaint.id}>

            <div className="complaint-info">
              <span className="complaint-id">
                {complaint.id}
              </span>

              <h2>{complaint.title}</h2>

              <p>
                Category: {complaint.category}
              </p>

              <p>
                Reported on: {complaint.date}
              </p>
            </div>

            <div className="complaint-status">
              <span
                className={`status ${complaint.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {complaint.status}
              </span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default MyComplaints;