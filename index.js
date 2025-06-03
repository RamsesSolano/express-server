const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'mi_clave_secreta_super_segura'; // 👈 Cámbiala en producción

app.use(bodyParser.json());

// Base de datos simulada
let users = [
  { id: 1, username: 'admin', password: 'admin123', name: 'Admin User' },
];

// 🔐 Generar token JWT
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: '1h',
  });
}

// 🔐 Middleware para verificar el token Bearer
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
}

// 🔓 Login con credenciales por parámetros
app.post('/login', (req, res) => {
    console.log(req.query)
    const { username, password } = req.query; // 👈 se leen desde los parámetros de URL
  
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });
  
    const token = generateToken(user);
    res.json({ token });
  });


// 🔵 GET - Listar todos los usuarios
app.get('/users', authenticateToken, (req, res) => {
  res.json(users);
});

// 🟡 POST - Crear un nuevo usuario
app.post('/users', authenticateToken, (req, res) => {
  const { username, password, name } = req.body;
  const id = users.length ? users[users.length - 1].id + 1 : 1;
  const newUser = { id, username, password, name };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 🟠 PUT - Actualizar un usuario
app.put('/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { username, password, name } = req.body;
  const user = users.find(u => u.id === parseInt(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  user.username = username || user.username;
  user.password = password || user.password;
  user.name = name || user.name;

  res.json(user);
});

// 🔴 DELETE - Eliminar un usuario
app.delete('/users/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === parseInt(id));
  if (index === -1) return res.status(404).json({ error: 'Usuario no encontrado' });

  const deletedUser = users.splice(index, 1);
  res.json({ message: 'Usuario eliminado', user: deletedUser[0] });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
