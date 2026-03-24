export function PostSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-2 w-16 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-200 rounded" />
        <div className="h-3 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-3/5 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="animate-pulse flex items-start gap-2 py-2">
      <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-20 bg-gray-200 rounded" />
        <div className="h-2.5 w-3/4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="animate-pulse flex items-start gap-3 px-4 py-3">
      <div className="w-2 mt-2 flex-shrink-0" />
      <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-3/4 bg-gray-200 rounded" />
        <div className="h-2 w-16 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
