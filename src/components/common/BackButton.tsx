import { useNavigate } from "react-router";

interface Props {
  label?: string;
}

// Generic back affordance — goes to the previous history entry.
const BackButton = ({ label = "Back" }: Props) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="text-blue-600 text-sm mb-3 inline-flex items-center gap-1 hover:underline"
    >
      ← {label}
    </button>
  );
};

export default BackButton;
