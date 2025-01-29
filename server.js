const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(__dirname));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar multer para almacenar imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, 'bot-img');
        if (!fs.existsSync(dir)) {
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

app.post('/save-character', upload.single('photo'), async (req, res) => {
    // Input validation
    if (!req.body.name || !req.file || !req.body.description || !req.body.personality) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const character = {
        name: req.body.name.trim(),
        photo: `/bot-img/${req.file.filename}`,
        description: req.body.description.trim(),
        personality: req.body.personality.trim()
    };

    const filePath = path.join(__dirname, 'bots', `${character.name}.json`);

    try {
        // Crear directorio si no existe
        const botsDir = path.join(__dirname, 'bots');
        if (!fs.existsSync(botsDir)) {
            fs.mkdirSync(botsDir);
        }
        
        fs.writeFileSync(filePath, JSON.stringify(character, null, 2));
        await uploadToGitHub(character.name, JSON.stringify(character, null, 2));
        res.status(200).json({ message: 'Character saved successfully and uploaded to GitHub', character });
    } catch (error) {
        console.error('Error handling character:', error);
        res.status(500).json({ message: 'Error handling character' });
    }
});

app.get('/get-bots', (req, res) => {
    const botsDir = path.join(__dirname, 'bots');

    // Crear el directorio si no existe
    if (!fs.existsSync(botsDir)) {
        fs.mkdirSync(botsDir);
    }

    try {
        const files = fs.readdirSync(botsDir);
        const bots = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                const botData = fs.readFileSync(path.join(botsDir, file), 'utf8');
                return JSON.parse(botData);
            });

        res.json(bots);
    } catch (err) {
        console.error('Error reading bots directory:', err);
        res.status(500).json({ message: 'Error reading bots' });
    }
});

// Servir imágenes estáticas
app.use('/bot-img', express.static(path.join(__dirname, 'bot-img')));

// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

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
