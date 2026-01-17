
import { db } from "@/lib/db";
import { usersTable } from "@/lib/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import WorkspaceProvider from "./provider"


async function WorkspaceLayout({ children }) {
  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!email) return null; // Or handle redirect

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  return (
    <>
      <WorkspaceProvider userCredits={dbUser?.credits || 0} userTier={dbUser?.tier || 'Free'}>
        {children}
      </WorkspaceProvider>
    </>
  )
}

export default WorkspaceLayout
