#!/usr/bin/env node

const main = require('./main');

main.fork(console.error, () => {});
