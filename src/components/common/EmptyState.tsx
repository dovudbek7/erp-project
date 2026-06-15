import { type ReactNode } from "react";
import { FiInbox } from "react-icons/fi";

interface Props {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

// Consistent empty-state placeholder used across screens.
function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6"
      role="status"
    >
      <div className="text-5xl text-gray-300 mb-4" aria-hidden="true">
        {icon ?? <FiInbox />}
      </div>
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      {description && (
        <p className="text-gray-400 mt-1 max-w-[420px]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
