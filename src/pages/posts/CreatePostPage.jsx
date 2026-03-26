import { useNavigate } from "react-router-dom";
import CreatePostBox from "../../components/posts/CreatePostBox";

export default function CreatePostPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto mt-10 px-2 sm:px-4 pb-16">
      <CreatePostBox onPostCreated={() => navigate("/dashboard")} />
    </div>
  );
}
