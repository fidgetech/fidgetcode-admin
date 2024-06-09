import { useFirebaseAdmin, getStudent } from './helpers.js';
import { getInput } from './cliUtils.js';

const options = [
  {
    flag: '--emulator <emulator>',
    description: 'use Firebase emulators',
    name: 'emulator',
    type: 'confirm',
    message: 'Use Firebase emulators?'
  },
  {
    flag: '--email <email>',
    description: 'email address',
    name: 'email',
    type: 'input',
    message: 'Email',
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email address'
  },
  {
    flag: '--track <track>',
    description: 'track syllabus identifier',
    name: 'track',
    type: 'input',
    message: 'Track syllabus identifier',
    validate: value => value.length > 0 || 'Track syllabus is required'
  },
];

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

const inputs = await getInput(options);
const { auth, db } = useFirebaseAdmin(inputs);
const { email, track } = inputs;

const trackId = await getTrackId(db, track);
await assignTrackToUserAuth({ email, trackId });
await assignTrackToUserFirestore({ email, trackId });
