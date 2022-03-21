import express, { Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import authenticationService from './AuthenticationService';
require('dotenv').config();

const app = express();

app.use(morgan("short"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
type User = {
  username: string;
  password: string;
  id: number;
  url2fa: string | null;
  twoFactorAuthenticationCode: string | null;
}

const users: Array<User> = [];


app.post('/auth/register', (req: Request, res: Response) => {
  const data = req.body;
  if (users.some(user => user.username === data.username)) {
    return res.status(400).json({message: 'The username has been taked'});
  }
  data.id = users.length;
  users.push(data as User);


  return res.status(201).json({id: data.id});
});


app.post('/auth/2fa/generate', (req: Request, res: Response) => {
  const user = users.find(user => req.body.id === user.id);
  if (!user) {
    return res.status(404).json({message: 'not found user'});
  }
  const userCode = authenticationService.getTwoFactorAuthenticationCode();
  user.url2fa = userCode.otpauthUrl || '';
  user.twoFactorAuthenticationCode = userCode.base32;

  return authenticationService.respondWithQRCode(user.url2fa, res);
})

app.post('/auth/2fa/activate', (req: Request, res: Response) => {
  const user = users.find((user) => (user.id === req.body.id))

  if (!user) {
    return res.status(404).json({message: 'user not found'});
  }

  authenticationService.verify2Fa(user, req.body.token);
  return res.status(200).send();
});

app.post('/auth/2fa/authenticate', (req: Request, res: Response) => {
  // usage the same to /auth/2fa/activate endpoint

  const user = users.find((user) => (user.id === req.body.id))

  if (!user) {
    return res.status(404).json({message: 'user not found'});
  }

  authenticationService.verify2Fa(user, req.body.token); 

  return res.status(200).json(
    {
      tokenAuthentication: "1234566"
    }
  )
})

app.listen(3000, () => {
  console.log('App started');
})
