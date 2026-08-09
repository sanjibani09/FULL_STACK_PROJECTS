import { Link } from "react-router-dom";
function Unauthorized() { return <main className="unauthorized"><p className="eyebrow">ACCESS RESTRICTED</p><h1>You don’t have permission to view this page.</h1><p>Your role does not include access to this resource. Please contact an administrator if you believe this is incorrect.</p><Link className="primary-button" to="/dashboard">Return to dashboard <span>→</span></Link></main>; }
export default Unauthorized;
