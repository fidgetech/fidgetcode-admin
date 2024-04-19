import { useFirebaseAdmin, getStudent, collectInput } from './helpers.js';
const { db, timestamp } = useFirebaseAdmin();

const emailPrompt = { email: { label: 'Student email: ' } };
const assignmentIdPrompt = { assignmentId: { label: 'Assignment ID: ' } };

const getAssignmentTemplates = async ({ trackId }) => {
  const coursesSnapshot = await db.collection('tracks').doc(trackId).collection('courses').get();
  const assignmentTemplates = await Promise.all(coursesSnapshot.docs.map(courseDoc =>
    courseDoc.ref.collection('assignmentTemplates').get()
  )).then(snapshots => 
    snapshots.flatMap(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  );
  return assignmentTemplates;
}

const assignAssignment = async ({ studentId, assignmentId }) => {
  const assignmentTemplate = assignmentTemplates.find(template => template.id === assignmentId);
  if (!assignmentTemplate) {
    console.error(`\n* Assignment ${assignmentId} not found\n`);
    return;
  }
  const { title, content, objectives, courseId, id: templateId } = assignmentTemplate;
  const assignmentRef = db.collection('students').doc(studentId).collection('assignments').doc();
  await assignmentRef.set({
    createdAt: timestamp,
    status: 'assigned',
    studentId,
    courseId,
    templateId,
    title,
    content,
    objectives,
  });
  console.log(`\n* Assignment ${assignmentTemplate.id} assigned to ${studentId}\n`);
}

const { email } = await collectInput({ prompts: emailPrompt });

const student = await getStudent(db, email);

const assignmentTemplates = await getAssignmentTemplates({ trackId: student.trackId });
console.log(assignmentTemplates);

const { assignmentId } = await collectInput({ prompts: assignmentIdPrompt });
await assignAssignment({ studentId: student.id, assignmentId });
