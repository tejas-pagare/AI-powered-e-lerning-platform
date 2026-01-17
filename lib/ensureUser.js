import { db } from './db';
import { usersTable } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Ensures a user exists in the database.
 * If the user doesn't exist, creates them.
 * 
 * @param {Object} clerkUser - The user object from Clerk's currentUser()
 * @returns {Promise<Object>} The user record from the database
 */
export async function ensureUserExists(clerkUser) {
    if (!clerkUser) {
        throw new Error('No user provided');
    }

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const name = clerkUser.fullName || clerkUser.firstName || 'User';

    if (!email) {
        throw new Error('User email is required');
    }

    try {
        // Check if user exists
        const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

        if (existingUser && existingUser.length > 0) {
            return existingUser[0];
        }

        // Create user if doesn't exist
        const newUser = await db
            .insert(usersTable)
            .values({
                name,
                email,
            })
            .returning();

        return newUser[0];
    } catch (error) {
        console.error('Error ensuring user exists:', error);
        throw error;
    }
}
