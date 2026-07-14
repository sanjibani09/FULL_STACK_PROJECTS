import { useState } from "react";

const accountKey = "postflow-account";

function Login({ onAuthenticated }) {
  const [mode, setMode] = useState("signin");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const isSignIn = mode === "signin";

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
  };

  const showError = (errorMessage) => {
    setMessage(errorMessage);
    setIsError(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");
    const savedAccount = JSON.parse(window.localStorage.getItem(accountKey) || "null");

    if (!isSignIn) {
      const fullName = formData.get("fullName").trim();
      if (password !== formData.get("confirmPassword")) {
        showError("Passwords do not match. Please try again.");
        return;
      }
      if (savedAccount?.email === email) {
        showError("An account already exists with this email. Please sign in.");
        return;
      }
      window.localStorage.setItem(accountKey, JSON.stringify({ fullName, email, password }));
      onAuthenticated({ name: fullName, message: "Your account was created successfully." });
      return;
    }

    if (!savedAccount) {
      showError("No account found. Please create an account first.");
      return;
    }
    if (savedAccount.email !== email || savedAccount.password !== password) {
      showError("Incorrect email or password. Please try again.");
      return;
    }
    onAuthenticated({ name: savedAccount.fullName, message: "You have successfully signed in." });
  };

  return (
    <main className="page">
      <section className="content-card login-card">
        <div className="eyebrow">PostFlow account</div>
        <h1>{isSignIn ? "Welcome back" : "Create your account"}</h1>
        <p>{isSignIn ? "Sign in with the account you already created." : "Create an account to start writing social posts."}</p>
        <div className="auth-tabs" role="tablist" aria-label="Account options">
          <button className={isSignIn ? "auth-tab active-auth-tab" : "auth-tab"} type="button" role="tab" aria-selected={isSignIn} onClick={() => switchMode("signin")}>Sign in</button>
          <button className={!isSignIn ? "auth-tab active-auth-tab" : "auth-tab"} type="button" role="tab" aria-selected={!isSignIn} onClick={() => switchMode("signup")}>Create account</button>
        </div>
        <form onSubmit={handleSubmit}>
          {!isSignIn && <label className="form-field">Full name<input type="text" name="fullName" placeholder="Your full name" required /></label>}
          <label className="form-field">Email address<input type="email" name="email" placeholder="you@example.com" required /></label>
          <label className="form-field">Password<input type="password" name="password" placeholder="Enter your password" minLength="6" required /></label>
          {!isSignIn && <label className="form-field">Confirm password<input type="password" name="confirmPassword" placeholder="Confirm your password" minLength="6" required /></label>}
          <button className="login-button" type="submit">{isSignIn ? "Sign in and create posts" : "Create account and continue"}</button>
        </form>
        <p className={isError ? "form-message form-error" : "form-message"} aria-live="polite">{message}</p>
      </section>
    </main>
  );
}

export default Login;
