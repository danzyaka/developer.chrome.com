const {dirname} = require('path');
const {mkdirSync, writeFileSync} = require('fs');
const sassProcessor = require('sass');

const entrypoints = [
  {
    src: './site/_scss/main.scss',
    dest: './dist/css/main.css',
  },
  {
    src: './site/_scss/chrome-main.scss',
    dest: './dist/css/chrome-main.css',
  },
  {
    src: './site/_scss/events-main.scss',
    dest: './dist/css/events-main.css',
  },
];

// Flags whether we generate sourcemaps
const isProduction = process.env.NODE_ENV === 'production';

// Techincally we're rendering synchronously so we don't need an async function,
// but gulp requires all tasks to return a promise.
const sass = async () => {
  // nb. No need to catch errors because gulp handles that for us and logs them.
  entrypoints.forEach(entrypoint => {
    const result = sassProcessor.renderSync({
      file: entrypoint.src,
      // nb. Sass doesn't actually write to this outFile, the caller must do that
      // themselves.
      // outFile is used to determine the URL used to link from the generated CSS
      // to the source map, and from the source map to the Sass source files.
      outFile: entrypoint.dest,
      sourceMap: !isProduction,
    });

    mkdirSync(dirname(entrypoint.dest), {recursive: true});
    writeFileSync(entrypoint.dest, result.css.toString(), 'utf8');

    // I'm not guarding for result.map here because if we're doing a dev build we
    // expect it to be defined and if it isn't, we want it to blow up.
    if (!isProduction) {
      writeFileSync(entrypoint.dest + '.map', result.map.toString(), 'utf8');
    }
  });
};

module.exports = sass;
