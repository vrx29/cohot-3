import { Notes, Sidebar } from "../components";

function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <Notes />
    </div>
  );
}

export default Home;
