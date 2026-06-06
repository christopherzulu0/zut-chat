import { currentUser } from "@clerk/nextjs/server";

export type ClerkUserContact = {
  userId: string;
  userName: string | null;
  userEmail: string | null;
};

export async function getClerkUserContact(
  userId: string
): Promise<ClerkUserContact> {
  const user = await currentUser();

  if (!user || user.id !== userId) {
    return { userId, userName: null, userEmail: null };
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const userName =
    user.fullName?.trim() ||
    fullName ||
    user.username ||
    null;

  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  );
  const userEmail =
    primaryEmail?.emailAddress ??
    user.emailAddresses[0]?.emailAddress ??
    null;

  return { userId, userName, userEmail };
}
