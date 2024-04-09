import serviceAccount from './fidgetcode-firebase-service-key.json' assert { type: 'json' };
import admin from 'firebase-admin';
import { collectInput } from './helpers.js';
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const auth = admin.auth();
const db = admin.firestore();

const heading = 'Enter user & track IDs to assign track to user';
const prompts = {
  email: { label: 'email: ' },
  trackSyllabus: { label: 'track syllabus: ' },
};

async function assignTrack({ email, trackSyllabus }) {
  const userAuthRecord = await auth.getUserByEmail(email);
  const uid = userAuthRecord.uid;
  const track = await db.collection('tracks').where('syllabus', '==', trackSyllabus).get();
  const trackId = track.docs[0].id;
  const existingCustomClaims = userAuthRecord.customClaims || {};
  const updatedCustomClaims = { ...existingCustomClaims, trackId };
  await auth.setCustomUserClaims(uid, updatedCustomClaims);
  console.log(`\n* Track ${trackId} assigned to ${userAuthRecord.email}\n`);
}

const inputs = await collectInput({ heading, prompts });
await assignTrack(inputs);
