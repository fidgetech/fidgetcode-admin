import { useFirebaseAdmin, getStudent, collectInput } from './helpers.js';
const { db } = useFirebaseAdmin();

const heading = 'Enter user & track IDs to assign track to user';
const prompts = {
  email: { label: 'email: ' },
  trackSyllabus: { label: 'track syllabus: ' },
};

async function assignTrack({ email, trackSyllabus }) {
  const trackSnapshot = await db.collection('tracks').where('syllabus', '==', trackSyllabus).get();
  const trackId = trackSnapshot.docs[0].id;
  const student = await getStudent(db, email);
  const studentRef = db.collection('students').doc(student.id);
  await studentRef.set({ trackId }, { merge: true });
  console.log(`\n* Track ${trackId} assigned to ${email}\n`);
}

const inputs = await collectInput({ heading, prompts });
await assignTrack(inputs);
