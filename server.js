const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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
    fs.writeFile(filePath, JSON.stringify(character, null, 2), (err) => {
        if (err) {
            console.error('Error saving character:', err);
            return res.status(500).json({ message: 'Error saving character' });
        }
        res.status(200).json({ message: 'Character saved successfully', character });
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
