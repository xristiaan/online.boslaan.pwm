'use strict';

const Homey = require('homey');

class PwmFan extends Homey.Driver {
	
	async onInit() {
		this.log('PwmFan has been initialized');
	}

    // this is the easiest method to overwrite, when only the template 'Drivers-Pairing-System-Views' is being used.
    onPairListDevices( data, callback )
    {
        // Required properties:
        //"data": { "id": "abcd" },

        // Optional properties, these overwrite those specified in app.json:
        // "name": "My Device",
        // "icon": "/my_icon.svg", // relative to: /drivers/<driver_id>/assets/
        // "capabilities": [ "onoff", "dim" ],
        // "capabilitiesOptions: { "onoff": {} },

        // Optional properties, device-specific:
        // "store": { "foo": "bar" },
        // "settings": { "my_setting": "my_value" },

        Homey.app.getBridge().getDevices().then( function( devices )
        {
			console.log( devices );
            callback( null, devices );

        } ).catch( function( err )
        {
            callback( new Error( "Connection Failed" + err ), [] );
        } );
    }
	
}

module.exports = PwmFan;
