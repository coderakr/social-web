import { FriendshipActionButton, SendFriendRequestButton } from "@/components/friend-actions";
import { LoadingLink } from "@/components/loading-link";
import { getInitials } from "@/lib/social";

type Person = {
  id: string;
  name: string;
  email: string;
};

type FriendshipRequest = {
  id: string;
  requester: Person;
  addressee: Person;
};

type NetworkOverviewProps = {
  currentUser: Person;
  acceptedConnections: Person[];
  incomingRequests: FriendshipRequest[];
  outgoingRequests: FriendshipRequest[];
  discoverableUsers: Person[];
  searchTerm: string;
  resetHref?: string;
  className?: string;
};

export function NetworkOverview({
  currentUser,
  acceptedConnections,
  incomingRequests,
  outgoingRequests,
  discoverableUsers,
  searchTerm,
  resetHref = "/network",
  className = "",
}: NetworkOverviewProps) {
  return (
    <div className={`w-full space-y-4 md:space-y-5 ${className}`}>
      <section className="sidebar-card rounded-[1.5rem] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <LoadingLink href="/profile" className="avatar-chip shrink-0" loadingMessage="Opening profile...">
            {getInitials(currentUser.name)}
          </LoadingLink>
          <div className="min-w-0">
            <LoadingLink
              href="/profile"
              className="truncate text-base font-semibold text-white transition-colors hover:text-[var(--accent-blue)]"
              loadingMessage="Opening profile..."
            >
              {currentUser.name}
            </LoadingLink>
            <p className="truncate text-sm text-[var(--accent-blue)]">{currentUser.email}</p>
          </div>
        </div>
      </section>

      <section className="sidebar-card rounded-[1.5rem] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-xl">Friends</p>
          <span className="text-sm text-[var(--accent-blue)]">{acceptedConnections.length}</span>
        </div>
        <div className="mt-4 space-y-3">
          {acceptedConnections.length === 0 ? (
            <div className="text-base leading-7 text-[var(--text-muted)]">No accepted friends yet.</div>
          ) : (
            acceptedConnections.slice(0, 8).map((friend) => (
              <div key={friend.id} className="flex items-center gap-3 rounded-2xl">
                <LoadingLink
                  href={`/profile/${friend.id}`}
                  className="avatar-chip h-11 w-11 shrink-0 text-sm"
                  loadingMessage={`Opening ${friend.name.toLowerCase()}'s profile...`}
                >
                  {getInitials(friend.name)}
                </LoadingLink>
                <div className="min-w-0">
                  <LoadingLink
                    href={`/profile/${friend.id}`}
                    className="truncate text-base font-medium text-white transition-colors hover:text-[var(--accent-blue)]"
                    loadingMessage={`Opening ${friend.name.toLowerCase()}'s profile...`}
                  >
                    {friend.name}
                  </LoadingLink>
                  <p className="truncate text-sm text-[var(--text-muted)]">{friend.email}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="sidebar-card rounded-[1.5rem] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-xl">Requests</p>
          <span className="status-pill status-pill-pending">{incomingRequests.length}</span>
        </div>
        <div className="mt-4 space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="text-base leading-7 text-[var(--text-muted)]">No incoming requests.</div>
          ) : (
            incomingRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-white/6 bg-white/[0.02] p-3.5">
                <p className="text-base font-semibold text-white">{request.requester.name}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{request.requester.email}</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <FriendshipActionButton friendshipId={request.id} action="accept" />
                  <FriendshipActionButton friendshipId={request.id} action="reject" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="sidebar-card rounded-[1.5rem] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-xl">Sent</p>
          <span className="text-sm text-[var(--accent-blue)]">{outgoingRequests.length}</span>
        </div>
        <div className="mt-4 space-y-3">
          {outgoingRequests.length === 0 ? (
            <div className="text-base leading-7 text-[var(--text-muted)]">No pending outgoing requests.</div>
          ) : (
            outgoingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-medium text-white">{request.addressee.name}</p>
                  <p className="truncate text-sm text-[var(--text-muted)]">{request.addressee.email}</p>
                </div>
                <span className="status-pill status-pill-pending">Pending</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="sidebar-card rounded-[1.5rem] p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-[1.35rem] font-semibold tracking-tight text-white sm:text-xl">Discover</p>
          <LoadingLink
            href={resetHref}
            className="text-sm font-medium text-white"
            loadingMessage="Refreshing friends..."
          >
            Reset
          </LoadingLink>
        </div>

        <form className="mt-4">
          <input
            className="app-input"
            name="q"
            defaultValue={searchTerm}
            placeholder="Search people"
          />
        </form>

        <div className="mt-4 space-y-4">
          {discoverableUsers.length === 0 ? (
            <div className="text-base leading-7 text-[var(--text-muted)]">No people available right now.</div>
          ) : (
            discoverableUsers.map((user) => (
              <div key={user.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="avatar-chip h-11 w-11 shrink-0 text-sm">{getInitials(user.name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-white">{user.name}</p>
                    <p className="truncate text-sm text-[var(--text-muted)]">{user.email}</p>
                  </div>
                </div>
                <div className="sm:shrink-0">
                  <SendFriendRequestButton userId={user.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
