import { program } from 'commander';
import inquirer from 'inquirer';

export const getInput = async (optionsList) => {
  const confirmValues = [true, 'TRUE', 'True', 'true', 'YES', 'Yes', 'yes', 'Y', 'y']
  const options = parseArgs(optionsList);
  let updatedOptions = await promptForMissingArgs(options, optionsList);
  updatedOptions['emulator'] = confirmValues.includes(updatedOptions['emulator']);
  return updatedOptions;
};

const parseArgs = (optionsList) => {
  optionsList.forEach(({ flag, description }) => {
    program.option(flag, description);
  });
  program.parse(process.argv);
  return program.opts();
};

const promptForMissingArgs = async (options, optionsList) => {
  const questions = optionsList.reduce((acc, { name, type, message, choices, mask, validate }) => {
    if (!options[name]) {
      acc.push({
        type,
        name,
        message,
        choices,
        mask,
        validate,
      });
    }
    return acc;
  }, []);
  const answers = await inquirer.prompt(questions);
  return { ...options, ...answers };
};
