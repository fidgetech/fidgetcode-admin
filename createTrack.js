import serviceAccount from './fidgetcode-firebase-service-key.json' assert { type: 'json' };
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const track = {
  title: 'Web Development',
  syllabus: 'for-now-just-link-to-syllabus-version',
};

const courseTitles = [
  'Introduction to Programming',
  'Intermedia JavaScript',
  'React',
  'C# and .NET',
];

const introAssignments = [
  {
    title: 'Git, HTML and CSS',
    content: 'Here is some **bolded** markdown content',
    objectives: [
      'Understand the basics of Git',
      'Understand the basics of HTML',
      'Understand the basics of CSS',
    ],
  },
  {
    title: 'Web Browsers',
    content: 'Here is some _italicized_ markdown content',
    objectives: [
      'Understand the basics of web browsers',
    ],
  },
];

const jsAssignments = [
  {
    title: 'JavaScript Basics',
    content: 'Here is some markdown content with a [link](https://www.example.com)',
    objectives: [
      'Understand the basics of JavaScript',
      'Understand the basics of variables',
      'Understand the basics of functions',
    ],
  },
];

async function createTrack({ title, syllabus }) {
  const trackRef = db.collection('tracks').doc();
  await trackRef.set({
    title,
    syllabus,
  });
  console.log(`\n* Created track: ${title} with id ${trackRef.id}`);
  return trackRef.id;
};

async function createCourses({ trackId, courseTitles }) {
  let courseMapping = {};
  for (const [index, title] of courseTitles.entries()) {
    // courses is subcollection of tracks
    const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc();
    await courseRef.set({
      trackId,
      number: index + 1,
      title,
    });
    courseMapping[title] = courseRef.id;
    console.log(`* Created course: ${title} with id ${courseRef.id}`);
  }
  return courseMapping;
}

async function createAssignments({ courseId, assignments }) {
  for (const [index, assignment] of assignments.entries()) {
    const { title, content, objectives } = assignment;
    const assignmentRef = db.collection('assignmentTemplates').doc();
    await assignmentRef.set({
      courseId,
      number: index + 1,
      title,
      content,
      objectives: objectives.map((objective, index) => ({ number: index + 1, content: objective })),
    });
    console.log(`* Created assignment: ${assignment.title} for course ${courseId}`);
  }
}

const trackId = await createTrack(track);
const courseMapping = await createCourses({ trackId, courseTitles });
await createAssignments({ courseId: courseMapping['Introduction to Programming'], assignments: introAssignments });
await createAssignments({ courseId: courseMapping['Intermedia JavaScript'], assignments: jsAssignments });
