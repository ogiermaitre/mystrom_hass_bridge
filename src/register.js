const fetch = require('node-fetch')
const arp = require('node-arp');

const bridgeAddr = process.env.BRIDGE_ADDR
const buttonAddr = process.env.BUTTON_ADDR
const buttonId = process.env.BUTTON_ID

const registerAction = (bridgeAddr, action, buttonId, buttonURL) => {
    const url = `${action}=get://${bridgeAddr}/`
    const uri = `test?id=${buttonId}&action=${action}`

    console.log(`${url}${uri}`)
    return fetch(buttonURL, {
        method: 'POST',
        body:`${url}${encodeURIComponent(uri)}`,
    })
        .then(d => d.json())
}

console.log(`Getting MAC address of ${buttonAddr}`)
arp.getMAC(buttonAddr, function (err, mac) {
    if (!err && mac.includes(':')) {

        const MAC = mac.replace(/:/g, '').toUpperCase()
        const buttonURL = `http://${buttonAddr}/api/v1/device/${MAC}`

        Promise.all([
            registerAction(bridgeAddr, 'single', buttonId, buttonURL),
            registerAction(bridgeAddr, 'double', buttonId, buttonURL),
            registerAction(bridgeAddr, 'touch', buttonId, buttonURL),
            registerAction(bridgeAddr, 'long', buttonId, buttonURL),
        ])
            .then((...a) => {
                console.log(a)
            })
    }
});

