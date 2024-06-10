// add additional assignment to track

import { useFirebaseAdmin, collectInput, listTracks, listCourses, listAssignmentTemplates } from '../helpers.js';
const { db } = useFirebaseAdmin();

const assignment =
  {
    title: 'Another assignment',
    content: 'Here is some exciting content',
    objectives: [
      'Some objective',
      'Another objective',
    ],
  };

async function createAssignment({ trackId, courseId, assignment, number }) {
  const { title, content, objectives } = assignment;
  // assignmentTemplates is subcollection of courses, which is subcollection of tracks
  const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc(courseId);
  const assignmentRef = courseRef.collection('assignmentTemplates').doc();
  await assignmentRef.set({
    courseId,
    number,
    title,
    content,
    objectives: objectives.map((objective, idx) => ({ number: idx + 1, content: objective })),
  });
  console.log(`* Created assignment: ${title} for course ${courseId}`);
}


listTracks(db);
const { trackId } = await collectInput({ heading: 'Enter track ID', prompts: { trackId: { label: 'trackId: ' } } });
listCourses(db, trackId);
const { courseId } = await collectInput({ heading: 'Enter course ID', prompts: { courseId: { label: 'courseId: ' } } });
listAssignmentTemplates(db, trackId, courseId);
const { number } = await collectInput({ heading: 'Enter assignment number', prompts: { number: { label: 'number: ' } } });
await createAssignment({ trackId, courseId, assignment, number });
