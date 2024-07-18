import { useFirebaseAdmin } from './helpers.js';
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
    flag: '--name <name>',
    description: 'name of the person',
    name: 'name',
    type: 'input',
    message: 'Name',
    validate: value => value.length > 0 || 'Name is required'
  },
  {
    flag: '--password <password>',
    description: 'password',
    name: 'password',
    type: 'password',
    message: 'Password (leave blank if sending invitation)',
    mask: '*',
    // validate: value => value.length >= 6 || 'Password should be at least 6 characters long'
  },
  {
    flag: '--role <role>',
    description: 'role of the person (student or teacher)',
    name: 'role',
    type: 'list',
    message: 'Role',
    choices: ['student', 'teacher']
  },
];

async function createAuthUser({ email, password, role }) {
  const userRecord = await auth.createUser({ email, ...(password && { password }) });
  console.log(`\n* User created with email: ${userRecord.email}`);

  await auth.setCustomUserClaims(userRecord.uid, { role });
  console.log(`* Role set to ${role} for ${userRecord.email}\n`);

  return userRecord;
}

async function createFirestoreUser({ userRecord, role, email, name }) {
  const uid = userRecord.uid; // // assign Firestore record same uid as in Auth
  const userRef = role === 'teacher' ? db.collection('teachers').doc(uid) : db.collection('students').doc(uid);
  await userRef.set({
    createdAt: timestamp,
    email,
    name,
    active: true,
  });
  console.log(`\n* ${role} document created for ${userRecord.email}`);
}

async function generatePasswordResetLink(email) {
  const link = await auth.generatePasswordResetLink(email)
  console.log('\n* Password reset link:', link);
}

const inputs = await getInput(options);
const { auth, db, timestamp } = useFirebaseAdmin(inputs);

console.log(inputs);
const userRecord = await createAuthUser(inputs);
await createFirestoreUser({ ...inputs, userRecord });

await generatePasswordResetLink(inputs.email);
