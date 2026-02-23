// Built-in plugins that are always available
module.exports = [
	require('./compression'),
	require('./cors'),
	require('./spa'),
	require('./proxy'),
	require('./auth'),
	require('./tunnel'),
	require('./health'),
	require('./upload'),
	require('./history')
];
