const express = require('express');
const formidable = require('express-formidable');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid').v4;

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT) || 8080;
const FILES_PATH = path.resolve(process.env.FILES_PATH || path.join(process.cwd(), './assets/'));
const EXPIRE_DELAY = Number(process.env.EXPIRE_DELAY) || 24 * 60 * 60 * 1000;
const EXPIRE_SCHEDULE = Number(process.env.EXPIRE_SCHEDULE) || 60 * 60 * 1000;

function invalidateFile() {
  criteria = Date.now() - EXPIRE_DELAY;
  fs.readdirSync(FILES_PATH, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(f => path.join(FILES_PATH, f.name))
    .filter(f => fs.statSync(f).ctime < criteria)
    .forEach(f => {
      fs.unlinkSync(f);
      console.log(`Expired file ${f}.`);
    });
}

setInterval(invalidateFile, EXPIRE_SCHEDULE);

if (!fs.existsSync(FILES_PATH)) {
  fs.mkdirSync(FILES_PATH, { recursive: true });
}

const app = express();
app.use(formidable());
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.get('/basedir', (req, res) => {
  return res
    .status(200)
    .json({ basedir: FILES_PATH });
});

app.get('/files', (req, res) => {
  const files = fs.readdirSync(FILES_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(f => f.name);

  return res
    .status(200)
    .json(files);
});

app.get('/files/output/:fileDir', (req, res) => {
  const files = fs.readdirSync(path.join(FILES_PATH, req.params.fileDir), { withFileTypes: true })
    .map(f => f.name);

  return res
    .status(200)
    .json(files);
});

app.get('/files/:fileDir?/:fileName', (req, res) => {
  if (!req.params.fileName) {
    return res
      .status(404)
      .end();
  }

  const fileDir = req.params.fileDir;
  const fileName = req.params.fileName;
  const givenName = req.header('given-name');
  const filePath = path.join(FILES_PATH, fileDir || '', req.params.fileName);

  if (!fs.existsSync(filePath)) {
    return res
      .status(404)
      .end();
  }

  return fs.createReadStream(filePath)
    .pipe(
      res
        .status(200)
        .header('Content-Disposition', givenName || fileName),
    );
});

app.post('/files', (req, res) => {
  const uploadedFile = (req.files || {}).file;

  if (!uploadedFile) {
    return res
      .status(400)
      .json({
        error: '"file" does not exist in request.',
      });
  }

  const fileName = uuid();
  const filePath = path.join(FILES_PATH, fileName);
  const fileSizeInKiB = Math.ceil(fs.statSync(uploadedFile.path).size / 1024);

  fs.copyFileSync(uploadedFile.path, filePath);
  fs.unlinkSync(uploadedFile.path);

  console.log(`Created file ${fileName}. (${fileSizeInKiB} KiB)`);

  return res
    .status(201)
    .json({ fileName: fileName });
});

app.delete('/files/:file', (req, res) => {
  const file = req.params.file;
  const filePath = path.join(FILES_PATH, file);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.warn(`Deleted file ${file}.`);
  } else {
    console.warn(`Delete request received, but file ${file} does not exist.`);
  }

  res
    .status(204)
    .end();
});

app.listen(PORT, HOST, () => console.log(`Server is listening on ${HOST}:${PORT}`));
