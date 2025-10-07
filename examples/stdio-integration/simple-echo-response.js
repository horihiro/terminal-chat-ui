
process.stdin.on('data', data => {
  if (data.toString().trim().toLowerCase() === 'exit' || data.toString().trim().toLowerCase() === 'quit') {
    console.log('Good bye!');
    process.exit(0);
  }
  process.stdout.write(`echo: ${data.toString().trim()}`);
});