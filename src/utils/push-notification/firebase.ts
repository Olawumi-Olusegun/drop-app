import dotenv from "dotenv";
dotenv.config();
import admin from 'firebase-admin';

// const serviceAccount = require('./path-to-serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount),});

admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    }),
});

export default admin;
