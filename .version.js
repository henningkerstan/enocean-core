// Project: @henningkerstan/byte
// File: .version.js 
// 
// Copyright 2021 Henning Kerstan
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const packageJson = require('./package.json')
const { exec, execSync } = require("child_process");
const { exit } = require('process');
const fs = require('fs')

// determine current branch
let branch = execSync('git branch --show-current').toString()
branch = branch.replace(/(\r\n|\n|\r)/gm,'');

console.log('Version v' + packageJson.version)

// check that we are running from main branch
if (branch !== 'main'){
  console.log('Cannot run from branch other than "main"')
  exit(-1)
}

// add new package.json
console.log('Staging updated "package.json" file')
execSync('git add package.json')

// generate and commit documentation for the new version
console.log('Generating documentation for library v' + packageJson.version)
execSync('npm run doc')
console.log('Creating ".nojekyll" file')
fs.writeFileSync('docs/.nojekyll', '')
console.log('Staging documentation')
execSync('git add -A docs/*')