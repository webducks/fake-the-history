const { execSync } = require('child_process');
const readline = require('readline-sync');
const fs = require('fs');

function generateRandom(str) {
  let [min, max] = str.split("-").map(Number);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCommits(folder, repo, maxCommits, startDate, endDate) {
  if(!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  process.chdir(folder);
  execSync('git init');

  const startTime = new Date(startDate).getTime() / 1000;
  const endTime = new Date(endDate).getTime() / 1000;

  for (let i = endTime; i >= startTime; i -= 60 * 60 * 24) {
    fs.mkdirSync(i.toString());
    process.chdir(i.toString());
    const numCommits = generateRandom(maxCommits);

    const date = new Date(i * 1000).toISOString().split('T')[0]; // Convert timestamp to date string

    console.log(`${numCommits} Commits done in ${date}`);

    for (let j = numCommits; j >= 0; j--) {
      const filename = `${i}_${j}`;
      const rDate = i;
      fs.writeFileSync(`${filename}.txt`, '');
      execSync(`git add ${filename}.txt`);
      execSync(`git commit --date=format:relative:${rDate}.seconds.ago -m ${filename}`);
    }

    process.chdir('..');
  }

  // execSync(`git remote add origin ${repo}`);
  try {
    execSync('git push origin main');
  } catch (error) {
    console.log('Error occurred during "git push". You can try pushing it later');
  }

}

function main() {
  console.log('Enter the min-max number of commits you\'d like in a day:');
  const commitsRange = readline.question('');

  console.log('Enter the start date (YYYY-MM-DD):');
  const startDate = readline.question('');

  console.log('Enter the end date (YYYY-MM-DD):');
  const endDate = readline.question('');

  console.log('Enter the repository link');
  const repo = readline.question('');
  const folder = repo.split("/")[1].replace(".git", "");

  console.log('\nMaking repo...');
  generateCommits(folder, repo, commitsRange, startDate, endDate);
  console.log('Done!');
  const shouldCleanup = readline.question('Wanna Clean-up? [y/n/L (only locally)] (n):');
  if(shouldCleanup.toLowerCase() === "y" || shouldCleanup.toLowerCase() === "l"){
    const currentDir = process.cwd();
    console.log(currentDir);
    const repoDir = `${currentDir}/${folder}`;
    if (fs.existsSync(repoDir)) {
      console.log('Deleting repo');
      fs.rmSync(repoDir, { recursive: true, force: true });
    } else {
      console.log('No repo to delete');
    }
  }else{
    return true;
  }
}

main();
