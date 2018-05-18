import index from './routes/index';
import profile from './routes/profile';
import stats from './routes/stats';
import live from './routes/owl/live';
import schedule from './routes/owl/schedule';
import standings from './routes/owl/standings';


export default function(app) {
  app.use('/', index);
  app.use('/profile', profile);
  app.use('/stats', stats);
  app.use('/owl/live', live);
  app.use('/owl/standings', standings);
  app.use('/owl/schedule', schedule);
}
