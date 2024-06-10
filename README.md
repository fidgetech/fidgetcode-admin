# Fidgetcode Admin

These scripts can be run interactively or with cli args.

For dev purposes, generally use with the Firebase emulators.

### Interactive usage

```
npm run createuser
npm run createtrack
npm run assigntrack
```

### Usage with CLI arguments

An example to create a teacher and two students, with each student assigned to a different track:

```
npm run createuser -- --emulator=true --email='teacher@fidgetech.org' --name='Teacher Test' --password='password' --role='teacher'
npm run createuser -- --emulator=true --email='student1@fidgetech.org' --name='Student One' --password='password' --role='student'
npm run createuser -- --emulator=true --email='student2@fidgetech.org' --name='Student Two' --password='password' --role='student'
npm run createtrack -- --emulator=true --syllabus='v1'
npm run createtrack -- --emulator=true --syllabus='v2'
npm run assigntrack -- --emulator=true --email='student1@fidgetech.org' --track='v1'
npm run assigntrack -- --emulator=true --email='student2@fidgetech.org' --track='v2'
```

#### Or use bash script:

```
bash seed.sh --password password --use-emulator
```

OR

```
bash seed.sh --password password
```
