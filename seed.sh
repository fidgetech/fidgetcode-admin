#!/bin/bash

USE_EMULATOR=false
PASSWORD=""

while [[ "$#" -gt 0 ]]; do
  case $1 in
    --use-emulator) USE_EMULATOR=true ;;
    --password) PASSWORD="$2"; shift ;;
    *) echo "Unknown parameter passed: $1"; exit 1 ;;
  esac
  shift
done

if [[ -z "$PASSWORD" ]]; then
  echo "Error: --password flag is required"
  exit 1
elif [[ ${#PASSWORD} -lt 6 ]]; then
  echo "Error: Password must be at least 6 characters long"
  exit 1
fi

npm run createuser -- --emulator=$USE_EMULATOR --password=$PASSWORD --email='teacher@fidgetech.org' --name='Teacher Test' --role='teacher'
npm run createuser -- --emulator=$USE_EMULATOR --password=$PASSWORD --email='student1@fidgetech.org' --name='Student One' --role='student'
npm run createuser -- --emulator=$USE_EMULATOR --password=$PASSWORD --email='student2@fidgetech.org' --name='Student Two' --role='student'
npm run createtrack -- --emulator=$USE_EMULATOR --syllabus='v1.1'
npm run createtrack -- --emulator=$USE_EMULATOR --syllabus='v1.2'
npm run assigntrack -- --emulator=$USE_EMULATOR --email='student1@fidgetech.org' --track='v1.1'
npm run assigntrack -- --emulator=$USE_EMULATOR --email='student2@fidgetech.org' --track='v1.2'
