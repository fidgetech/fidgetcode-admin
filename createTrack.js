import { useFirebaseAdmin } from './helpers.js';
const { db } = useFirebaseAdmin();

const track = {
  title: 'Web Development',
  syllabus: 'v1',
};

const courses = [
  { title: 'Introduction to Programming', slug: 'intro' },
  { title: 'Intermediate JavaScript', slug: 'js' },
  { title: 'React', slug: 'react' },
  { title: 'C# and .NET', slug: 'c-and-net' },
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

async function createCourses({ trackId, courses }) {
  let courseMapping = {};
  for (const [index, course] of courses.entries()) {
    const { title, slug } = course;
    // courses is subcollection of tracks
    const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc();
    await courseRef.set({
      trackId,
      number: index + 1,
      title,
      slug,
    });
    courseMapping[title] = courseRef.id;
    console.log(`* Created course: ${title} with id ${courseRef.id}`);
  }
  return courseMapping;
}

async function createAssignments({ trackId, courseId, assignments }) {
  for (const [index, assignment] of assignments.entries()) {
    const { title, content, objectives } = assignment;
    // assignmentTemplates is subcollection of courses, which is subcollection of tracks
    const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc(courseId);
    const assignmentRef = courseRef.collection('assignmentTemplates').doc();
    await assignmentRef.set({
      courseId,
      number: index + 1,
      title,
      content,
      objectives: objectives.map((objective, idx) => ({ number: idx + 1, content: objective })),
    });
    console.log(`* Created assignment: ${title} for course ${courseId}`);
  }
}

const trackId = await createTrack(track);
const courseMapping = await createCourses({ trackId, courses });
await createAssignments({ trackId, courseId: courseMapping['Introduction to Programming'], assignments: introAssignments });
await createAssignments({ trackId, courseId: courseMapping['Intermediate JavaScript'], assignments: jsAssignments });
