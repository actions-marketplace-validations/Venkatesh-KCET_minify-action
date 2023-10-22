const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const htmlMinifier = require('html-minifier');
const csso = require('csso'); // Use csso for CSS minification
const UglifyJS = require('uglify-js');

const rootFolder = './'; // Change this to your root folder path
const minifyFolder = './minify';

// Function to minify HTML using html-minifier
function minifyHTML(html) {
  return htmlMinifier.minify(html, {
    collapseWhitespace: true,
    removeComments: true,
  });
}

// Function to minify CSS using csso
function minifyCSS(css) {
  return csso.minify(css).css;
}

// Function to minify JavaScript using UglifyJS
function minifyJS(js) {
  return UglifyJS.minify(js).code;
}

// Recursively copy and minify files from the source to the destination
async function copyAndMinifyFiles(source, destination) {
  const items = await fse.readdir(source);
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const destinationPath = path.join(destination, item);
    const stats = await fse.stat(sourcePath);

    if (stats.isDirectory()) {
      if (sourcePath !== minifyFolder) {
        await fse.ensureDir(destinationPath);
        await copyAndMinifyFiles(sourcePath, destinationPath);
      }
    } else if (stats.isFile()) {
      const fileExt = path.extname(item).toLowerCase();
      if (fileExt === '.html') {
        const html = await fse.readFile(sourcePath, 'utf8');
        const minifiedHTML = minifyHTML(html);
        await fse.writeFile(destinationPath, minifiedHTML, 'utf8');
      } else if (fileExt === '.css') {
        const css = await fse.readFile(sourcePath, 'utf8');
        const minifiedCSS = minifyCSS(css);
        await fse.writeFile(destinationPath, minifiedCSS, 'utf8');
      } else if (fileExt === '.js') {
        const js = await fse.readFile(sourcePath, 'utf8');
        const minifiedJS = minifyJS(js);
        await fse.writeFile(destinationPath, minifiedJS, 'utf8');
      } else {
        await fse.copy(sourcePath, destinationPath);
      }
    }
  }
}

async function main() {
  try {
    // Ensure the 'minify' folder exists
    await fse.ensureDir(minifyFolder);

    // Copy and minify files from the root folder to 'minify' folder, skipping the 'minify' folder itself
    await copyAndMinifyFiles(rootFolder, minifyFolder);

    console.log('Files copied and minified successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();