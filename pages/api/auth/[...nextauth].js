import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Change this if your org's email domain is ever different.
const ALLOWED_DOMAIN = 're-circuit.com';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Hints Google's account picker to show org accounts first —
          // this is a convenience, not a security boundary on its own,
          // so we also check the email domain below.
          hd: ALLOWED_DOMAIN,
          prompt: 'select_account',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.email) return false;
      return profile.email.toLowerCase().endsWith('@' + ALLOWED_DOMAIN);
    },
  },
  session: {
    strategy: 'jwt',
  },
};

export default NextAuth(authOptions);
