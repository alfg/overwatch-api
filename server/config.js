const config = {
    CACHE_TTL: process.env.CACHE_TTL || 60 * 5, // 5 minute default.
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};

export default config;