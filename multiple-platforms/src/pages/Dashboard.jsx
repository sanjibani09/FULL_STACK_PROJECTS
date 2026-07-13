import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import PostComposer from "../components/postcomposer";

function Dashboard() {
  return (
    <>
      <Navbar page="home" setPage={() => {}} />

      <div className="container">

        <Sidebar />

        <PostComposer />

      </div>

      <Footer />
    </>
  );
}

export default Dashboard;
