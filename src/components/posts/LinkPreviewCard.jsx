export default function LinkPreviewCard({ preview }) {
  if (!preview || !preview.title) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-3 border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
    >
      {preview.image_url && (
        <img
          src={preview.image_url}
          alt=""
          className="w-full h-40 object-cover bg-gray-100"
          onError={(e) => { e.target.style.display = "none"; }}
        />
      )}
      <div className="px-3 py-2">
        <p className="text-sm font-medium text-gray-900 line-clamp-1">
          {preview.title}
        </p>
        {preview.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {preview.description}
          </p>
        )}
        {preview.domain && (
          <p className="text-[11px] text-gray-400 mt-1">{preview.domain}</p>
        )}
      </div>
    </a>
  );
}
