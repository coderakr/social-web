import { AppShell } from "@/components/app-shell";
import { NetworkOverview } from "@/components/network-overview";
import prisma from "@/lib/prisma";
import { requireServerSession } from "@/lib/session";

type NetworkPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function NetworkPage({ searchParams }: NetworkPageProps) {
  const session = await requireServerSession();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const searchTerm = resolvedSearchParams?.q?.trim() ?? "";

  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ requesterId: session.user.id }, { addresseeId: session.user.id }],
    },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      addressee: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const incomingRequests = friendships.filter(
    (friendship) =>
      friendship.status === "PENDING" && friendship.addresseeId === session.user.id,
  );

  const outgoingRequests = friendships.filter(
    (friendship) =>
      friendship.status === "PENDING" && friendship.requesterId === session.user.id,
  );

  const acceptedConnections = friendships
    .filter((friendship) => friendship.status === "ACCEPTED")
    .map((friendship) =>
      friendship.requesterId === session.user.id ? friendship.addressee : friendship.requester,
    );

  const blockedUserIds = new Set<string>([
    session.user.id,
    ...friendships
      .filter((friendship) => friendship.status === "PENDING" || friendship.status === "ACCEPTED")
      .flatMap((friendship) => [friendship.requesterId, friendship.addresseeId]),
  ]);

  const discoverableUsers = await prisma.user.findMany({
    where: {
      id: {
        notIn: [...blockedUserIds],
      },
      OR: searchTerm
        ? [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ]
        : undefined,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  return (
    <AppShell
      active="network"
      title="Friends"
      subtitle="Manage friends, accept requests, and discover people to add."
      user={session.user}
    >
      <NetworkOverview
        currentUser={session.user}
        acceptedConnections={acceptedConnections}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        discoverableUsers={discoverableUsers}
        searchTerm={searchTerm}
      />
    </AppShell>
  );
}
