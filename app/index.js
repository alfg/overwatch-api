import profile from './routes/profile';

export default function(app) {
  app.use('/profile', profile);
}
