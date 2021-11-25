const a = require('./a');
a.on('ready', () => {
  console.log('module "a" is ready');
});
