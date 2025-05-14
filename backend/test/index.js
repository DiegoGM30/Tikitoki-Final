const app = require('../app/app');
const db = require('../app/models');

let server;

// Wait for Express to be running
before(done => {
    server = app.listen(4000, done);
});

require('./routes/video.routes.test');
require('./routes/auth.routes.test');

// Shutdown server
after(async () => {
    server.close();
    await db.sequelize.close();
});
/*
// Shutdown server
after(done => {
    server.close(done);
});
*/