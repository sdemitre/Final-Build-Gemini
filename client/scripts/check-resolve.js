const path = require('path');
try {
  console.log('Trying to require App');
  const app = require(path.resolve(__dirname, '../src/App.tsx'));
  console.log('App required OK');
} catch (e) {
  console.error('App require failed:', e && e.message);
}
try {
  console.log('Trying to require AuthContext');
  const auth = require(path.resolve(__dirname, '../src/context/AuthContext.tsx'));
  console.log('AuthContext required OK');
} catch (e) {
  console.error('AuthContext require failed:', e && e.message);
}
