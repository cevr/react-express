const app = require('express')();
const os = require('os');
const ifaces = os.networkInterfaces();
const bodyParser = require('body-parser');
const fs = require('fs');
const data = __dirname + '/data.txt';
const port = 4000;
let ip;

Object.keys(ifaces).forEach(function(ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function(iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
        }

        if (alias >= 1) {
            // this single interface has multiple ipv4 addresses
            console.log(ifname + ':' + alias, iface.address);
        } else {
            // this interface has only one ipv4 adress
            console.log(ifname, iface.address);
            ip = iface.address;
        }
        ++alias;
    });
});

let array = [];
let users = {};
let cookieJar = {};

try {
    users = JSON.parse(fs.readFileSync(data));
} catch (err) {
    console.log(err);
}

parseCookies = cookie => {
    let newCookie = cookie.split('=');
    let objCookie = { sessionId: Number(newCookie[1]) };
    console.log(objCookie);
    return objCookie;
};

// app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.raw({ type: '*/*' }));

app.post('/signUp', (req, res) => {
    let payload = JSON.parse(req.body);
    console.log('1', payload);
    if (payload.username && payload.password) {
        console.log('before', users);
        users[payload.username] = {
            list: [],
            password: payload.password
        };
        res.set(
            'Set-Cookie',
            `session-Id=${Math.floor(Math.random() * 100000000)}`
        );
        console.log('after', users);
        res.send('success');
        fs.writeFileSync(data, JSON.stringify(users));
    }
});
app.post('/login', (req, res) => {
    let payload = JSON.parse(req.body);
    let cookie = parseCookies(req.headers.cookie);
    if (payload.password === users[payload.username].password) {
        cookieJar[cookie.sessionId] = payload.username;
        console.log('cookie', cookieJar);
        res.send(users[payload.username].list);
    } else res.send('no account or wrong passsword');
});
app.post('/todos', (req, res) => {
    let cookie = parseCookies(req.headers.cookie);
    if (`${cookie.sessionId}` in cookieJar) {
        console.log('@todos', users[cookieJar[cookie.sessionId]].list);
        res.send(
            JSON.stringify({
                list: users[cookieJar[cookie.sessionId]].list,
                user: cookieJar[cookie.sessionId]
            })
        );
    } else res.send({ loggedIn: 'nope' });
});

app.post('/addTodos', (req, res) => {
    let payload = JSON.parse(req.body);
    users[payload.username].list = users[payload.username].list.concat(
        payload.value.toString()
    );
    fs.writeFileSync(data, JSON.stringify(users));
});

app.post('/clearTodos', (req, res) => {
    let payload = JSON.parse(req.body);

    users[payload.username].list = [];
    res.send(JSON.stringify(users[payload.username].list));
    fs.writeFileSync(data, JSON.stringify(users));
});
app.listen(port, () => console.log(`http://${ip}:${port}`));
