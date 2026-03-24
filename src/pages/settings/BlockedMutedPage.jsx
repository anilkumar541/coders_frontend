import { useBlockedUsers, useMutedUsers, useBlockUser, useMuteUser } from "../../hooks/usePosts";
import { Avatar } from "../../components/layout/Navbar";
import { Loader2 } from "lucide-react";

function UserRow({ user, actionLabel, onAction, isPending }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <Avatar user={user} size="sm" />
        <span className="text-sm font-medium text-gray-900">{user.username}</span>
      </div>
      <button
        onClick={() => onAction(user.id)}
        disabled={isPending}
        className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:border-gray-900 hover:text-gray-900 disabled:opacity-50 cursor-pointer transition-colors flex items-center gap-1.5"
      >
        {isPending && <Loader2 size={13} className="animate-spin" />}
        {actionLabel}
      </button>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-1 mb-4">{description}</p>
      {children}
    </div>
  );
}

export default function BlockedMutedPage() {
  const { data: blockedData, isLoading: loadingBlocked } = useBlockedUsers();
  const { data: mutedData, isLoading: loadingMuted } = useMutedUsers();
  const blockMutation = useBlockUser();
  const muteMutation = useMuteUser();

  const blockedUsers = blockedData?.data ?? [];
  const mutedUsers = mutedData?.data ?? [];

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4 pb-16">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h1>

      <Section
        title="Blocked Users"
        description="Blocked users cannot see your posts and you won't see theirs. Blocking is mutual."
      >
        {loadingBlocked ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : blockedUsers.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">You haven't blocked anyone.</p>
        ) : (
          blockedUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              actionLabel="Unblock"
              onAction={(id) => blockMutation.mutate(id)}
              isPending={blockMutation.isPending && blockMutation.variables === user.id}
            />
          ))
        )}
      </Section>

      <Section
        title="Muted Users"
        description="Muted users' posts won't appear in your feeds. They can still see your posts."
      >
        {loadingMuted ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : mutedUsers.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">You haven't muted anyone.</p>
        ) : (
          mutedUsers.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              actionLabel="Unmute"
              onAction={(id) => muteMutation.mutate(id)}
              isPending={muteMutation.isPending && muteMutation.variables === user.id}
            />
          ))
        )}
      </Section>
    </div>
  );
}
