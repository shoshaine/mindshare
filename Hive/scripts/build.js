const fs = require('fs').promises;
const path = require('path');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'dist');

const EXCLUDES = new Set([
  'node_modules', '.git', '.github', 'dist', 'src', 'scripts', 'package-lock.json',
  'README.md', 'NETLIFY_DEPLOY.md'
]);

const replacements = new Map(); // originalName -> replacementName (both basename and relative path)

function sanitizeBasename(basename) {
  // remove any fragment markers like '#...' or '-#...'
  // e.g. 'foo.svg#Fragment' -> 'foo.svg', 'foo.eot-#iefix' -> 'foo.eot'
  return basename.replace(/-?#.*$/, '');
}

async function copyRecursive(src, dest) {
  const stat = await fs.lstat(src);
  if (stat.isDirectory()) {
    const name = path.basename(src);
    if (EXCLUDES.has(name)) return;
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src);
    await Promise.all(entries.map(entry => copyRecursive(path.join(src, entry), path.join(dest, entry))));
  } else if (stat.isFile()) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    const basename = path.basename(dest);
    const relFromRoot = path.relative(ROOT, src).replace(/\\/g, '/');
    const sanitizedBasename = sanitizeBasename(basename);
    const destDir = path.dirname(dest);
    const finalDest = path.join(destDir, sanitizedBasename);

    // If the basename was altered, record replacements for CSS/HTML post-processing
    if (sanitizedBasename !== basename) {
      const relDest = path.relative(ROOT, finalDest).replace(/\\/g, '/');
      replacements.set(basename, sanitizedBasename);
      replacements.set(relFromRoot, relDest);
    }

    await fs.copyFile(src, finalDest);
  }
}

async function build() {
  try {
    // wipe dist
    await fs.rm(OUT, { recursive: true, force: true });
  } catch (e) {
    // ignore
  }
  await copyRecursive(ROOT, OUT);
  // Post-process text files to replace any occurrences of invalid filenames
  // with the sanitized versions recorded during copy.
  const textExtensions = new Set(['.css', '.html', '.htm', '.js']);
  async function postProcess(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await postProcess(full);
        continue;
      }
      if (!textExtensions.has(path.extname(e.name).toLowerCase())) continue;
      let content = await fs.readFile(full, 'utf8');
      let changed = false;
      for (const [orig, repl] of replacements) {
        if (content.indexOf(orig) !== -1) {
          // Special-case patterns like 'eot-#iefix' -> 'eot?#iefix'
          if (/-.?#/.test(orig) && orig.indexOf('#') !== -1) {
            const m = orig.match(/([^.]+\.[^\-#]+)-#(.*)$/);
            if (m) {
              const base = m[1];
              const frag = m[2];
              const replacement = `${base}?#${frag}`;
              content = content.split(orig).join(replacement);
              changed = true;
              continue;
            }
          }
          content = content.split(orig).join(repl);
          changed = true;
        }
      }
      if (changed) await fs.writeFile(full, content, 'utf8');
    }
  }

  await postProcess(OUT);
  console.log('Built static site to', OUT);
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
