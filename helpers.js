import fs from 'fs/promises';
import admin from 'firebase-admin';
const serviceAccount = JSON.parse(await fs.readFile(new URL('./fidgetcode-firebase-service-key.json', import.meta.url), 'utf-8'));

export const useFirebaseAdmin = ({ emulator }) => {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  if (emulator) {
    console.log('\nUsing auth emulator...');
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
  }
  const auth = admin.auth();  
  const db = admin.firestore();
  if (emulator) {
    console.log('Using Firestore emulator...\n');
    db.settings({ host: 'localhost:8080', ssl: false });
  }
  if (!emulator) console.log('\n\n*** WARNING: Not using emulators ***\n\n');
  const timestamp = admin.firestore.FieldValue.serverTimestamp()
  return { auth, db, timestamp };
}

export const getStudent = async (db, email) => {
  const studentSnapshot = await db.collection('students').where('email', '==', email).get();
  const studentDoc = studentSnapshot.docs[0];
  return { id: studentDoc.id, ...studentDoc.data() };  
}

export const listTracks = async(db) => {
  const snapshot = await db.collection('tracks').get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

export const listCourses = async(db, trackId) => {
  const snapshot = await db.collection('tracks').doc(trackId).collection('courses').get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

export const listAssignmentTemplates = async (db, trackId) => {
  const coursesSnapshot = await db.collection('tracks').doc(trackId).collection('courses').get();
  const assignmentTemplates = await Promise.all(coursesSnapshot.docs.map(courseDoc =>
    courseDoc.ref.collection('assignmentTemplates').get()
  )).then(snapshots => 
    snapshots.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  );
  console.log(assignmentTemplates);
}
