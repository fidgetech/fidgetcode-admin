import { useFirebaseAdmin, getStudent, collectInput } from './helpers.js';
const { auth, db } = useFirebaseAdmin();

const heading = 'Enter user & track IDs to assign track to user';
const prompts = {
  email: { label: 'email: ' },
  trackSyllabus: { label: 'track syllabus: ' },
};

async function getTrackId(db, syllabus) {
  const trackSnapshot = await db.collection('tracks').where('syllabus', '==', syllabus).get();
  return trackSnapshot.docs[0].id;
}

async function assignTrackToUserAuth({ email, trackId }) {
  const userAuthRecord = await auth.getUserByEmail(email);
  const uid = userAuthRecord.uid;
  const existingCustomClaims = userAuthRecord.customClaims || {};
  await auth.setCustomUserClaims(uid, { ...existingCustomClaims, trackId });
  console.log(`* Track ${trackId} assigned to ${email} in Auth\n`);
}

async function assignTrackToUserFirestore({ email, trackId }) {
  const student = await getStudent(db, email);
  const studentRef = db.collection('students').doc(student.id);
  await studentRef.set({ trackId }, { merge: true });
  console.log(`* Track ${trackId} assigned to ${email} in Firestore\n`);
}

const { email, trackSyllabus } = await collectInput({ heading, prompts });
const trackId = await getTrackId(db, trackSyllabus);
await assignTrackToUserAuth({ email, trackId });
await assignTrackToUserFirestore({ email, trackId });
