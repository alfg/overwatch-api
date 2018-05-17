import { getProfile, getStats } from './parser';
import { getLiveMatch, getSchedule, getStandings } from './owl';

const owl = { getLiveMatch, getSchedule, getStandings };

export {
    getProfile,
    getStats,
    owl,
}