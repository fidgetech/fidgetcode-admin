import serviceAccount from './fidgetcode-firebase-service-key.json' assert { type: 'json' };
import admin from 'firebase-admin';
import { question } from './helpers.js';
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = admin.auth();
const db = admin.firestore();

let prompts = {
  email: { label: 'email: ' },
  name: { label: 'name: ' },
  role: { label: 'role ("admin" or "student"): ', options: ['admin', 'student'] },
};

const collectInput = async () => {
  console.log('\n*******************\nEnter user details:\n');
  let results = {};
  for (const key in prompts) {
    const prompt = prompts[key];
    results[key] = await question(prompt.label, prompt.options);
  }
  return results;
}

async function createAuthUser({ email, role }) {
  const userRecord = await auth.createUser({ email });
  console.log(`\n* User created with email: ${userRecord.email}`);

  await auth.setCustomUserClaims(userRecord.uid, { role });
  console.log(`* Role set to ${role} for ${userRecord.email}\n`);

  return userRecord;
}

async function createFirestoreUser({ userRecord, email, role, name }) {
  // Create a document in Firestore 'users' collection with the same user ID
  const userRef = db.collection('users').doc(userRecord.uid);
  const userData = {
    createdAt: userRecord.metadata.creationTime,
    email,
    name,
    role,
  };
  await userRef.set(userData);
  console.log(`\n* User document created for ${userRecord.email}`);
}

async function generatePasswordResetLink(email) {
  const link = await auth.generatePasswordResetLink(email)
  console.log('\n* Password reset link:', link);
}

const inputs = await collectInput();
const userRecord = await createAuthUser(inputs);
await createFirestoreUser({ ...inputs, userRecord });
await generatePasswordResetLink(inputs.email);
