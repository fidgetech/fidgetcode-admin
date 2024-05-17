import serviceAccount from './fidgetcode-firebase-service-key.json' assert { type: 'json' };
import admin from 'firebase-admin';
import readline from 'readline';

export const useFirebaseAdmin = () => {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const usingEmulator = process.argv.includes('--emulator');
  if (usingEmulator) {
    console.log('\nUsing auth emulator...');
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
  }
  const auth = admin.auth();  
  const db = admin.firestore();
  if (usingEmulator) {
    console.log('Using Firestore emulator...\n');
    db.settings({ host: 'localhost:8080', ssl: false });
  }
  if (!usingEmulator) console.log('\n\n*** WARNING: Not using emulators ***\n\n');
  const timestamp = admin.firestore.FieldValue.serverTimestamp()
  return { auth, db, timestamp };
}

export const getStudent = async (db, email) => {
  const studentSnapshot = await db.collection('students').where('email', '==', email).get();
  const studentDoc = studentSnapshot.docs[0];
  return { id: studentDoc.id, ...studentDoc.data() };  
}

const question = (query, options) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = () => {
    rl.question(query, (answer) => {
      if (answer.trim().length === 0) {
        console.log('Input is required.');
        ask();
      } else if (options && !options.includes(answer)) {
        console.log(`Invalid input. Please enter one of the following: ${options.join(', ')}`);
        ask();
      } else {
        rl.close();
        resolve(answer);
      }
    });
  };  
  ask();
});

export const collectInput = async ({ heading, prompts }) => {
  if (heading) console.log(`\n*******************\n${heading}:\n`);
  let results = {};
  for (const key in prompts) {
    const prompt = prompts[key];
    results[key] = await question(prompt.label, prompt.options);
  }
  return results;
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
