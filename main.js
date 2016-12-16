const {exec, spawn} = require('child_process');
const Task = require('data.task');
const inquirer = require('inquirer');

const getContainers = () =>
  new Task((rej, res) =>
    exec('docker ps', {encoding: 'utf8'}, (e, c) => e ? rej(e) : res(c)));

const getQuestions = choices => ([{
  type: 'list',
  name: 'containerId',
  message: 'Select a container',
  choices
}]);

const choices = getContainers()
  .map(s => s.trim())
  .map(s => s.split(/\n/))
  .map(s => s.slice(1))
  .map(s =>
    s.map(_s => {
      const __s = _s.split(/\s{3,}/g);
      return {
        value: __s[0],
        name: `${__s[6]} - ${__s[0]}`
      };
    })
  );

const initPrompt = questions =>
  new Task((rej, res) =>
    inquirer.prompt(questions)
      .then(res)
      .catch(rej)
  );

const spawnContainer = containerId =>
  new Task((rej, res) => {
    const docker = spawn('docker', ['exec', '-it', containerId, 'bash'], {stdio: 'inherit'});
    return docker.pid ? res() : docker.on('error', rej);
  });

module.exports = choices
  .map(getQuestions)
  .chain(initPrompt)
  .map(answers => answers.containerId)
  .chain(spawnContainer);
