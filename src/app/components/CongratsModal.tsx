type CongratsModalProps = {
  show: boolean;
  onClose: () => void;
};

export default function CongratsModal({ show, onClose }: CongratsModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-3">🎉 Congratulations! 🎉</h2>
        <p className="text-lg mb-6">
          You have completed all three daily challenges!
        </p>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
