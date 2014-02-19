
'use strict';

var fs = require('fs');

var DEFAULT_DB_LOCATION = 'server/db.json';
var db;

function createDb(path, callback) {
	function loadDb(clb) {
		fs.exists(path, function(exists) {
			if (exists) {
				fs.readFile(path, function(err, val) {
					if (err) {
						return clb(err);
					}
					
					clb(null, JSON.parse(val));
				});
			} else {
				clb(null, {});
			}
		});
	}
	
	loadDb(function(err, contents) {
		if (err) {
			return callback(err);
		}
		
		callback(null, {
			get: function(key, c) {
				c(null, contents[key]);
			},
			
			set: function(key, value, c) {
				contents[key] = value;
				fs.writeFile(path, JSON.stringify(contents), c);
			},
			
			del: function(key, c) {
				delete contents[key];
				fs.writeFile(path, JSON.stringify(contents), c);
			}
		});
	});
}

// DB Startup routine
module.exports.startup = function(callback, dblocation) {
	dblocation = dblocation || DEFAULT_DB_LOCATION;
	createDb(dblocation, function(err, jsonDb) {
		if (err) {
			return callback(err);
		}
		
		db = jsonDb;
		db.get('users', function(err, val) {
			if (err) { 
				return callback(err); 
			}
			
			if (!val) {
				
				// users
				db.set('users', [
					{ name: 'Martin' },
					{ name: 'Isidor' },
					{ name: 'Joh' },
					{ name: 'André' },
					{ name: 'João' },
					{ name: 'Ben' },
					{ name: 'Alex' },
					{ name: 'Erich' },
					{ name: 'Dirk' },
					{ name: 'Redmond' }
				], function(err) {
					if (err) { 
						return callback(err); 
					}
					
					return callback(null, true);
				});
			} else {
				return callback(null, false);
			}
		});
	});
};

// Get users
module.exports.getUsers = function(callback) {
	return db.get('users', callback);
};

// Get status
module.exports.getStatus = function(callback) {
	var users = db.get('users', function(err, users) {
		var stage = db.get('stage', function(err, stage) {
			if (err) { 
				return callback(err); 
			}
			
			return callback(null, {
				users: users,
				stage: stage	
			});
		});
	});
};

// Get stage
module.exports.getStage = function(callback) {
	return db.get('stage', callback);
};

// Set stage
module.exports.setStage = function(current, order, callback) {
	return db.set('stage', {
		current: current,
		order: order
	}, callback);	
};

// Clear stage
module.exports.clearStage = function(callback) {
	return db.del('stage', callback);
};

// IsRunning
module.exports.isRunning = function(callback) {
	var stage = db.get('stage', function(err, stage) {
		return callback(err, !!stage);
	});
}