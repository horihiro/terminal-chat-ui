
process.stdin.on('data', async (data) => {
  if (data.toString().trim().toLowerCase() === 'exit' || data.toString().trim().toLowerCase() === 'quit') {
    console.log('Good bye!');
    process.exit(0);
  }
  await [...data.toString().trim()].reduce(async (promise, c) => {
    await promise;
    process.stdout.write(c);
    return new Promise(resolve => setTimeout(resolve, 100));
  }, Promise.resolve());
});