import "./Pages.css";

function Login() {
  return (
    <div className="page-container">
      <div className="form-card">
        <h1>Welcome Back</h1>
        <p>Login to manage and track your civic complaints.</p>

        <form>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
          />

          <button type="submit" className="form-btn">
            Login
          </button>
        </form>

        <p className="form-footer">
          Don't have an account? <span>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;