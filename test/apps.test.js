var should = require('should');
var ServerPilot = require('..');
var sp;
var appId, serverId;
var options = {
    name: 'testapp',
    sysuserid: '',
    runtime: 'php5.5',
    domains: ['testapp.com']
};

function catchCreateAppException(opts) {
    return function() {
        try {
            sp.createApp(opts, function() {} );
        } catch (e) {
            return;
        }
        throw new Error('No error throw by class with options: ' + JSON.stringify(opts));
    };
}

describe('Apps', function() {

    before(function(done) {
        sp = new ServerPilot({
            clientId: process.env.SP_CLIENT_ID,
            apiKey: process.env.SP_API_KEY
        });

        // Create a dummy server
        sp.createServer('testserver', function(err, data) {
            serverId = data.data.id;

            // Get the sysuserid of that server
            sp.getSysUsers(function(err, data) {
                var sysusers = data.data;

                for (var i = sysusers.length - 1; i >= 0; i--) {
                    if (sysusers[i].serverid === serverId) {
                        options.sysuserid = sysusers[i].id;

                        done();
                    }
                }
            });
        });
    });

    describe('.getApps()', function() {
        it('should get all apps', function(done) {
            sp.getApps(function(err, data) {
                if (err) { return done(err); }
                data.should.be.an.Object;
                data.data.should.be.an.Object;
                done();
            });
        });
    });

    describe('.createApp(options)', function() {
        it('should throw when no options passed', catchCreateAppException());
        it('should throw when empty options passed', catchCreateAppException({}));
        it('should throw when no name passed', catchCreateAppException({ sysuserid: options.sysuserid, runtime: options.runtime }));
        it('should throw when no sysuserid passed', catchCreateAppException({ name: options.name, runtime: options.runtime }));
        it('should throw when no runtime passed', catchCreateAppException({ sysuserid: options.sysuserid, name: options.name }));
        it('should create an app', function(done) {
            sp.createApp(options, function(err, data) {
                if (err) { return done(err); }

                data.data.name.should.eql(options.name);
                data.data.runtime.should.eql(options.runtime);
                data.data.domains.should.eql(options.domains);

                // Set stuff to use later
                appId = data.data.id;

                done();
            });
        });
    });

    describe('.getApp(id)', function() {
        it('should get an app', function(done) {
            sp.getApp( appId, function(err, data) {
                if (err) { return done(err); }
                data.should.be.an.Object;
                data.data.should.be.an.Object;
                done();
            });
        });
    });

    after(function(done) {
        // Destroy the server
        sp.deleteServer(serverId, function(err, data) {
            done();
        });
    });

});