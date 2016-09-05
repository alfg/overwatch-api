import profile from './routes/profile';
import stats from './routes/stats';

export default function(app) {
  app.use('/profile', profile);
  app.use('/stats', stats);
}
