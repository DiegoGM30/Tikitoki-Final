const app = require('./app/app');

// Listening port
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`[vB.2] Service listening at port ${port}`);
});