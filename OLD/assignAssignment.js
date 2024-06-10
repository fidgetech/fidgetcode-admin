import { useFirebaseAdmin, getStudent, listAssignmentTemplates, collectInput } from '../helpers.js';

const emailPrompt = { email: { label: 'Student email: ' } };
const assignmentIdPrompt = { assignmentId: { label: 'Assignment ID: ' } };

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

const assignmentTemplates = await listAssignmentTemplates(db, student.trackId);

const { assignmentId } = await collectInput({ prompts: assignmentIdPrompt });
await assignAssignment({ studentId: student.id, assignmentId });
