import readline from 'readline';

const question = (query, options) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = () => {
    rl.question(query, (answer) => {
      if (answer.trim().length === 0) {
        console.log('Input is required.');
        ask();
      } else if (options && !options.includes(answer)) {
        console.log(`Invalid input. Please enter one of the following: ${options.join(', ')}`);
        ask();
      } else {
        rl.close();
        resolve(answer);
      }
    });
  };  
  ask();
});

export const collectInput = async ({ heading, prompts }) => {
  console.log(`\n*******************\n${heading}:\n`);
  let results = {};
  for (const key in prompts) {
    const prompt = prompts[key];
    results[key] = await question(prompt.label, prompt.options);
  }
  return results;
}
