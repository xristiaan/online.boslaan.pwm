'use strict';

const Homey = require( 'homey' );
const { EventEmitter } = require( 'events' );
const fetch = require( 'node-fetch' );

module.exports = class ArgonConnectBridge extends EventEmitter
{
    constructor()
    {
        super();
        return this;
    }

    async getDevices()
    {
        var devices = [];
        Homey.app.updateLog("Start of getDevices");

        try
        {
            var IPAddresses = ["192.168.2.71"]
            // need to scan the network for Argon devices; or do we need to do that somewhere else

            // const ArgonDevices = await this.sendMessage( 'get', 'devicedata' );    // for now only returns one device
            // TODO, scan for Argon devices and get a list of IP addresses, neglect the ones which are already registered

            //IPAddresses = scan for ArgonDevices();
            //for now, just use the one know device

            if ( IPAddresses.length > 0 )
            {
                for ( const IPAddress of IPAddresses )
                {
                    Homey.app.updateLog("now querying", IPAddress);

                    var result = await this.sendMessage('devicedata', IPAddress);           // read the data from the device

                    //Homey.app.updateLog(result);

                    var iconName = "venetianblind.svg";

                    devices.push({
                        name: result.device.deviceType,
                        icon: iconName,
                        data: {
                            id: result.device.macAddress,
                            ip: result.device.IP
                        },
                        setting: {
                            ip: result.device.IP
                        }
                    });
                }
                return devices;
            }
        }
        catch ( err )
        {
            Homey.app.updateLog( "Failed to get Devices from the Hub ****" );
        }

        return "";
    }

    async getAirFlow (IPAddress) {
        var result = "";
        console.log( 'started getAirFlow: ');

        result = await this.sendMessage( 'dutycycle', IPAddress);

        // Refresh GUI after 15 seconds regardless of polling options
        Homey.app.setPollTime( 15, true );

        var maxAirFlow =  Homey.ManagerSettings.get( 'maxAirFlow' );
        if ( result != -1 )
        {
            return result.settings.dutycycle * maxAirFlow;
        }

        return -1;
    }

    async setAirFlow ( airFlow , IPAddress) {
        if ( typeof airFlow != 'number' )
        {
            return "";
        }

        console.log( "setAirFlow | started with parameters", airFlow, IPAddress );
        var maxAirFlow =  Homey.ManagerSettings.get( 'maxAirFlow' )
        var dutyCycle = Math.max(0.0, Math.min(airFlow / maxAirFlow, 1.0));
        console.log( "setAirFlow | setting dutyCycle to ", dutyCycle);

        var result = "";
        result = await this.sendMessage( 'dutycycle/' + dutyCycle, IPAddress);
        console.log("setAIrFlow | result.setting:", result.setting);
        if ( result != -1 && result.settings.dutycycle == dutyCycle)
        {
            return result.settings.dutycycle * maxAirFlow;
        }

        return -1;
    }

    async sendMessage( path , ip)
    {
        var errMsg = "";
        console.log( 'sendMessage: ', path);
        try
        {
            /* if (Homey.ManagerSettings.get( 'deviceIP' ) == "")
            {
                return -1;
            } */

            //const address = ip || Homey.ManagerSettings.get( 'deviceIP' );
            var address = ip + ":8080/";
            var connectResult = await this._call(
            {
                method: "get",
                address: address,
                path: path,
                body: "",
            });

            //console.log('sendMessage Result: ', connectResult);

            if ( connectResult && connectResult.status && connectResult.status.status && connectResult.status.status == 200)
            {
                    console.log(connectResult.status.status, connectResult.status.message, connectResult.status.changedVar);
                    return connectResult;
            }
        }
        catch ( err )
        {
            Homey.app.updateLog( "Connection Failed: " + err );

            errMsg = err.message.toLowerCase();
        }

        return -1;
    }

    async _call(
    {
        address,
        method,
        path,
        body,
    } )
    {
        if ( !address )
        {
            throw new Error( 'Missing URL' );
        }

        const url = `http://${address}${path}`;
        const opts = {
            method,
            headers:
            {
                'content-type': 'application/json',
            },
        }

        const res = await fetch( url, opts );
        Homey.app.updateLog("_call | fetch HTTP status: ", res.status)

        var bodyText;
        if ( res.status === 200 )
        {
            bodyText = await res.json();
        }
        else
        {
            // Get the reply as text as it will possibly be an error message
            bodyText = await res.text();
        }

        // Make sure there is something to return and the status was good
        if ( bodyText && ( res.status === 200 ) )
        {
            return bodyText;
        }

        if ( !res.ok )
        {
            // The result was bad so throw an error
            // console.log('status: ', res.status);
            const err = new Error( ( bodyText && bodyText.error && bodyText.error.message ) || ( bodyText ) || 'Unknown Error' );
            err.code = res.status;
            throw err;
        }

        return bodyText;
    }
}
