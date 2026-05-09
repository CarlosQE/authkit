const jsonServer = require('json-server');
const crypto     = require('crypto');

const server      = jsonServer.create();
const router      = jsonServer.router('./mock-api/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const fakeToken = (userId) =>
  Buffer.from(JSON.stringify({ userId, exp: Date.now() + 3600000 })).toString('base64');

server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const users = router.db.get('users').value();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_CREDENTIALS',
      message: 'Email o contraseña incorrectos',
      statusCode: 401,
    });
  }

  const { password: _, ...safeUser } = user;
  return res.status(200).json({
    success: true,
    message: 'Login exitoso',
    data: {
      accessToken:  fakeToken(user.id),
      refreshToken: fakeToken(user.id) + '_refresh',
      expiresIn:    3600,
      user:         safeUser,
    },
  });
});

server.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const users = router.db.get('users').value();

  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      code: 'EMAIL_ALREADY_EXISTS',
      message: 'Ya existe una cuenta con ese email',
      statusCode: 409,
    });
  }

  const newUser = {
    id:        crypto.randomUUID(),
    email,
    password,
    firstName,
    lastName,
    role:      'viewer',
    createdAt: new Date().toISOString(),
  };

  router.db.get('users').push(newUser).write();

  const { password: _, ...safeUser } = newUser;
  return res.status(201).json({
    success: true,
    message: 'Cuenta creada exitosamente',
    data: {
      accessToken:  fakeToken(newUser.id),
      refreshToken: fakeToken(newUser.id) + '_refresh',
      expiresIn:    3600,
      user:         safeUser,
    },
  });
});

server.get('/api/auth/me', (req, res) => {
  const auth = req.headers['authorization'];

  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, code: 'NO_TOKEN', statusCode: 401 });
  }

  try {
    const token   = auth.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const user    = router.db.get('users').find({ id: String(payload.userId) }).value();

    if (!user) {
      return res.status(401).json({ success: false, code: 'USER_NOT_FOUND', statusCode: 401 });
    }

    const { password: _, ...safeUser } = user;
    return res.status(200).json({ success: true, data: safeUser, message: 'OK' });

  } catch {
    return res.status(401).json({ success: false, code: 'INVALID_TOKEN', statusCode: 401 });
  }
});

server.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, code: 'NO_REFRESH_TOKEN', statusCode: 401 });
  }

  return res.status(200).json({
    success: true,
    message: 'Token renovado',
    data: {
      accessToken:  refreshToken.replace('_refresh', '') + '_new',
      refreshToken: refreshToken + '_new',
      expiresIn:    3600,
    },
  });
});

server.use('/api', router);
server.listen(3000, () => console.log('Mock API corriendo en http://localhost:3000'));