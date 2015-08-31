let params = {
    baseURL: process.env.NODE_ENV === 'production' ? '/' : '/',
    port: process.env.NODE_ENV === 'production' ? 5858 : 5000
};

module.exports = params;
