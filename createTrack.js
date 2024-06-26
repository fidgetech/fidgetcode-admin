import { useFirebaseAdmin } from './helpers.js';
import { getInput } from './cliUtils.js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const title = 'Web Development';
const assignmentsPath = 'independent-projects';
const courses = [
  { title: 'Introduction to Programming', slug: 'intro' },
  { title: 'Intermediate JavaScript', slug: 'js' },
  { title: 'React', slug: 'react' },
  { title: 'C# and .NET', slug: 'c-and-net' },
];

const options = [
  {
    flag: '--emulator <emulator>',
    description: 'use Firebase emulators',
    name: 'emulator',
    type: 'confirm',
    message: 'Use Firebase emulators?'
  },
  {
    flag: '--syllabus <syllabus>',
    description: 'syllabus version',
    name: 'syllabus',
    type: 'input',
    message: 'Syllabus version',
    validate: value => value.length > 0 || 'Syllabus version is required'
  },
];

async function createTrack({ title, syllabus }) {
  const trackRef = db.collection('tracks').doc();
  await trackRef.set({
    createdAt: timestamp,
    title,
    syllabus,
  });
  console.log(`\n* Created track: ${title} with syllabus ${syllabus} and id ${trackRef.id}`);
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
    courseMapping[slug] = courseRef.id;
    console.log(`* Created course: ${title} with id ${courseRef.id}`);
  }
  return courseMapping;
}

async function createAssignments({ trackId, courseId, courseSlug, assignments }) {
  for (const [index, assignment] of assignments.entries()) {
    const { title, content, objectives } = assignment;
    // assignmentTemplates is subcollection of courses, which is subcollection of tracks
    const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc(courseId);
    const assignmentRef = courseRef.collection('assignmentTemplates').doc();
    await assignmentRef.set({
      courseId,
      courseSlug,
      number: index + 1,
      title,
      content,
      objectives: objectives.map((objective, idx) => ({ number: idx + 1, content: objective })),
    });
    console.log(`* Created assignment: ${title} for course ${courseId}`);
  }
}

async function readAssignments({ assignmentsPath, courses }) {
  const directories = courses.map(course => course.slug);
  let assignments = {};
  for (const directory of directories) {
    const markdownPath = path.join(assignmentsPath, directory);
    const files = fs.readdirSync(markdownPath);
    assignments[directory] = [];
    for (const file of files) {
      const fileContent = fs.readFileSync(`${markdownPath}/${file}`, 'utf8');
      const { data: { title, objectives }, content } = matter(fileContent);
      assignments[directory].push({ title, content, objectives });
    }
  }
  return assignments;
}

const assignments = await readAssignments({ assignmentsPath, courses });

const inputs = await getInput(options);
const { db, timestamp } = useFirebaseAdmin(inputs);

const track = { title, syllabus: inputs.syllabus };
const trackId = await createTrack(track);
const courseMapping = await createCourses({ trackId, courses });
for (const [course, courseAssignments] of Object.entries(assignments)) {
  await createAssignments({
    trackId,
    courseId: courseMapping[course],
    courseSlug: course,
    assignments: courseAssignments
  });
}
