import { useFirebaseAdmin } from './helpers.js';
import { getInput } from './cliUtils.js';
// import fs from 'fs';
// import path from 'path';
// import matter from 'gray-matter';
import { v4 as uuidv4 } from 'uuid';
import slug from 'slug';
import { githubFetch } from './githubFetch.js';

const title = 'Web Development';
const courses = [
  {
    title: 'Introduction to Programming',
    slug: 'intro',
    assignments: [
      '1_git_html_and_css.md',
      '2_javascript_and_web_browsers.md',
      '3_arrays_and_looping.md'
    ]
  },
  {
    title: 'Intermediate JavaScript',
    slug: 'js',
    assignments: [
      '1_object_oriented_javascript.md',
      '2_test_driven_development.md',
      '3_asynchrony_and_apis.md'
    ]
  },
  {
    title: 'React',
    slug: 'react',
    assignments: [
      '1_functional_programming.md',
      '2_react_fundamentals.md',
      '3_redux.md'
    ]
  },
  {
    title: 'C# and .NET',
    slug: 'c-and-net',
    assignments: [
      '1_tdd_with_c_sharp.md',
      '2_basic_web_applications.md',
      '3_database_basics.md',
      '4_many_to_many_relationships.md',
      '5_authentication_with_identity.md',
      '6_building_an_api.md'
    ]
  },
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
  const trackRef = db.collection('tracks').doc(syllabus); // create with syllabus version as id
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
    const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc(slug); // create with slug as id
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
    const { title, content, objectives, source } = assignment;
    // assignmentTemplates is subcollection of courses, which is subcollection of tracks
    const assignmentId = `${slug(title)}-${uuidv4().split('-')[0]}`;
    const courseRef = db.collection('tracks').doc(trackId).collection('courses').doc(courseId);
    const assignmentRef = courseRef.collection('assignmentTemplates').doc(assignmentId); // create with slug + uuid as id
    await assignmentRef.set({
      source: constructSourceUrl(`${courseSlug}/${source}`),
      courseId,
      courseSlug,
      number: index + 1,
      title,
      content,
      objectives,
    });
    console.log(`* Created assignment: ${title} for course ${courseId}`);
  }
}

function constructSourceUrl(path) {
  const org = process.env.GITHUB_ORG;
  const repo = process.env.GITHUB_INDEPENDENT_PROJECTS_REPO;
  return `https://github.com/${org}/${repo}/blob/main/${path}`;
}

async function fetchAssignments({ courses }) {
  let assignments = {};
  for (const course of courses) {
    assignments[course.slug] = [];
    for (const assignment of course.assignments) {
      const { title, objectives, content } = await githubFetch({ path: `${course.slug}/${assignment}` });
      assignments[course.slug].push({ title, objectives, content, source: assignment });
    }
  }
  return assignments;
}


const assignments = await fetchAssignments({ courses });

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
