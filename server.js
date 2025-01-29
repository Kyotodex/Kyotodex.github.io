const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;

app.use(express.json());
// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(__dirname));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

app.use(express.static(path.join(__dirname, 'public')));

// Configurar multer para almacenar imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'bot-img');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/save-character', upload.single('photo'), (req, res) => {
    const character = {
        name: req.body.name,
        photo: `/bot-img/${req.file.filename}`,
        description: req.body.description,
        personality: req.body.personality
    };

    const filePath = path.join(__dirname, 'bots', `${character.name}.json`);
    fs.writeFile(filePath, JSON.stringify(character, null, 2), async (err) => {
        if (err) {
            console.error('Error saving character:', err);
            return res.status(500).json({ message: 'Error saving character' });
        }

        try {
            await uploadToGitHub(character.name, JSON.stringify(character, null, 2));
            res.status(200).json({ message: 'Character saved successfully and uploaded to GitHub', character });
        } catch (error) {
            console.error('Error uploading to GitHub:', error);
            res.status(500).json({ message: 'Character saved but failed to upload to GitHub' });
        }
    });
});

app.get('/get-bots', (req, res) => {
    const botsDir = path.join(__dirname, 'bots');
    
    // Crear el directorio si no existe
    if (!fs.existsSync(botsDir)){
        fs.mkdirSync(botsDir);
    }

    fs.readdir(botsDir, (err, files) => {
        if (err) {
            console.error('Error reading bots directory:', err);
            return res.status(500).json({ message: 'Error reading bots' });
        }

        const bots = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const botData = fs.readFileSync(path.join(botsDir, file), 'utf8');
                return JSON.parse(botData);
            });

        res.json(bots);
    });
});

// Servir imágenes estáticas
app.use('/bot-img', express.static(path.join(__dirname, 'bot-img')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function uploadToGitHub(filename, content) {
    const GITHUB_TOKEN = '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';
    const REPO_OWNER = 'Kyotodex';
    const REPO_NAME = 'Kyotodex.github.io';
    const FILE_PATH = `bots/${filename}.json`;

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: `Add bot ${filename}`,
            content: Buffer.from(content).toString('base64')
        })
    });

    if (!response.ok) {
        throw new Error(`GitHub API responded with status ${response.status}`);
    }

    return response.json();
}
