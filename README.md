# Fidgetcode Admin

These are interactive scripts that ask for needed info.

- `npm run createuser`
- `npm run createtrack`
- `npm run assigntrack`

To run with Firebase emulators, add `-- --emulator`

An example to create a teacher and two students, with each student assigned to a different track:

```
npm run createuser -- --emulator=true --email='teacher@example.com' --name='Teacher Test' --password='password' --role='teacher'
npm run createuser -- --emulator=true --email='student1@example.com' --name='Student One' --password='password' --role='student'
npm run createuser -- --emulator=true --email='student2@example.com' --name='Student Two' --password='password' --role='student'
npm run createtrack -- --emulator=true --syllabus='v1'
npm run createtrack -- --emulator=true --syllabus='v2'
npm run assigntrack -- --emulator=true --email='student1@example.com' --track='v1'
npm run assigntrack -- --emulator=true --email='student2@example.com' --track='v2'
```
