import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { headers } from 'next/headers'
import { db } from './db'

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    emailAndPassword: {
        enabled: true,
    },
    trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
})

export type SessionWithUser = {
    user: {
        id: string
        name: string
        email: string
        emailVerified: boolean
        image: string | null | undefined
        createdAt: Date
        updatedAt: Date
    }
    session: {
        id: string
        expiresAt: Date
        token: string
        createdAt: Date
        updatedAt: Date
        userId: string
    }
}

export async function getSession(): Promise<SessionWithUser['session'] & { user: SessionWithUser['user'] } | null> {
    const h = await headers()
    const result = await auth.api.getSession({ headers: h })
    
    if (!result?.session || !result?.user) return null
    
    return {
        ...result.session,
        user: {
            ...result.user,
            image: result.user.image ?? null,
        },
    }
}

export async function getUserId(): Promise<string | null> {
    const session = await getSession()
    if (!session) return null
    return session.user?.id ?? null
}