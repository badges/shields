var request = require('request');

var apiUrl = 'https://pypi.python.org/pypi/Fabric3/json';

var info = 'vnopre';

// from pip: https://github.com/pypa/pip/blob/231178f/pip/_vendor/packaging/version.py#L159

var pypiVersionRegEx = /v?(?:(?:([0-9]+)!)?([0-9]+(?:\.[0-9]+)*)([-_\.]?(?:a|b|c|rc|alpha|beta|pre|preview)[-_\.]?(?:[0-9]+)?)?((?:-(?:[0-9]+))|(?:[-_\.]?(?:post|rev|r)[-_\.]?(?:[0-9]+)?))?([-_\.]?(?:dev)[-_\.]?(?:[0-9]+)?)?)(?:\+([a-z0-9]+(?:[-_\.][a-z0-9]+)*))?/;

function pypiVersionParts(version) {
    var parts = version.match(pypiVersionRegEx);
    // epoch, release, pre, post, dev, local
    return {'epoch': parts[1], 'release': parts[2], 'pre': parts[3],
            'post': parts[4], 'dev': parts[5], 'local': parts[6]};
}

function pypiVersionCmp(v1, v2) {
    if (v1.epoch > v2.epoch) {return 1;}
    else if (v1.epoch < v2.epoch) {return -1;}

    r1 = v1.release.split('.').map(Number);
    r2 = v2.release.split('.').map(Number);
    for (i = 0; i < Math.max(r1.length, r2.length); i++) {
        if ((r1[i] || 0) > (r2[i] || 0)) {return 1;}
        else if ((r1[i] || 0) < (r2[i] || 0)) {return -1;}
    }

    if (v1.post > v2.post) {return 1;}
    else if (v1.post < v2.post) {return -1;}

    return 0;
}

function pypiLatestStableVersion(versions) {
    versions = (versions
        .map(pypiVersionParts)
        .filter(function(v) {return !(v.pre || v.dev)})
        .sort(pypiVersionCmp));

    var latest = versions[versions.length - 1];
    var version = '';

    if (latest.epoch) {version += latest.epoch + '!';}
    if (latest.release) {version += latest.release;}
    if (latest.post) {version += latest.post;}

    return version;
}

request(apiUrl, function(err, res, buffer) {
    var data = JSON.parse(buffer);
    if (info === 'v') {
        var version = data.info.version;
        var vdata = versionColor(version);
        badgeData.text[1] = vdata.version;
        badgeData.colorscheme = vdata.color;
        sendBadge(format, badgeData);
    } else if (info === 'vnopre') {
        var version = pypiLatestStableVersion(Object.keys(data.releases));
        console.log(version);
    } else {
        console.log("didn't do anything");
    }
});
