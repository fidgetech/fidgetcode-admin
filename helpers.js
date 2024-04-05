import readline from 'readline';

export const question = (query, options) => new Promise((resolve) => {
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
