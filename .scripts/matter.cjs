const matter = require('gray-matter');
const path = require('path');
const fs = require("fs");
const FOLDER_READ = './src/content/blog/';
const JSON_OUTPUT = './public/search.json';
let search = [];

/**
 * @description Read files synchronously from a folder_READ, with natural sorting
 * @param {String} dir Absolute path to directory
 * @returns {Object[]} List of object, each object represent a file
 * structured like so: `{ filepath, name, ext }`
 */
function readFilesSync(dir) {
  const files = [];

  fs.readdirSync(dir).forEach(filename => {
    const name = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const filepath = path.resolve(dir, filename);
    const stat = fs.statSync(filepath);
    const isFile = stat.isFile();

    if (isFile) files.push({ filepath, name, ext });
  });

  files.sort((a, b) => {
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  return files;
}

const files = readFilesSync(FOLDER_READ);

files.forEach(file => {
  const fileReaded = fs.readFileSync(file.filepath);
  const frontMatter = matter(fileReaded);
  search.push(frontMatter.data);
})

fs.writeFileSync(JSON_OUTPUT, JSON.stringify(search, null, 2));
