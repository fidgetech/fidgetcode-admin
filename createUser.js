import serviceAccount from './fidgetcode-firebase-service-key.json' assert { type: 'json' };
import admin from 'firebase-admin';
import { collectInput } from './helpers.js';
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = admin.auth();
const db = admin.firestore();

const heading = 'Enter user details';
const prompts = {
  email: { label: 'email: ' },
  name: { label: 'name: ' },
  role: { label: 'role ("admin" or "student"): ', options: ['admin', 'student'] },
};

async function createAuthUser({ email, role }) {
  const userRecord = await auth.createUser({ email });
  console.log(`\n* User created with email: ${userRecord.email}`);

  await auth.setCustomUserClaims(userRecord.uid, { role });
  console.log(`* Role set to ${role} for ${userRecord.email}\n`);

  return userRecord;
}

async function createFirestoreUser({ userRecord, role, email, name }) {
  const uid = userRecord.uid; // // assign Firestore record same uid as in Auth
  const userRef = role === 'admin' ? db.collection('admins').doc(uid) : db.collection('students').doc(uid);
  await userRef.set({
    createdAt: userRecord.metadata.creationTime,
    email,
    name,    
  });
  console.log(`\n* ${role} document created for ${userRecord.email}`);
}

async function generatePasswordResetLink(email) {
  const link = await auth.generatePasswordResetLink(email)
  console.log('\n* Password reset link:', link);
}

const inputs = await collectInput({ heading, prompts });
const userRecord = await createAuthUser(inputs);
await createFirestoreUser({ ...inputs, userRecord });
await generatePasswordResetLink(inputs.email);
