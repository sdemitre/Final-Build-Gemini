try {
  console.log('require("./App") ->');
  console.log(require.resolve('./App'));
} catch (e) {
  console.error('resolve ./App failed:', e && e.message);
}
try {
  console.log('require("./context/AuthContext") ->');
  console.log(require.resolve('./context/AuthContext'));
} catch (e) {
  console.error('resolve ./context/AuthContext failed:', e && e.message);
}
