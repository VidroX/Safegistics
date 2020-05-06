export const config = {
    general: {
        appName: 'Safegistics',
        sessionCookie: 'sg_session',
        devMode: process.env.NODE_ENV === 'development'
    },
    api: {
        url: "http://192.168.1.62:5000/graphql",
    },
    icons: { size: "1.5rem" },
    tables: {
        rowHeight: 80.57,
        headerHeight: 63.43,
        rowsPerPage: 5,
    }
};
