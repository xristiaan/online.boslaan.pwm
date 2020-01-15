'use strict';

const Homey = require( 'homey' );
const ArgonConnectBridge = require( '../../lib/ArgonConnectBridge' );

class PwmFan extends Homey.Device
{
    async onInit()
    {
        try
        {
            Homey.app.updateLog( 'Device initialising( Name: ' + this.getName() + ', Class: ' + this.getClass() + ")" );

            this.initDevice();
            Homey.app.updateLog( 'Device initialised( Name: ' + this.getName() + ")" );
        }
        catch ( err )
        {
            Homey.app.updateLog( this.getName() + " OnInit Error: " + err );
        }

        // register a capability listener
        this.registerCapabilityListener( 'airflow', this.onCapabilityAirFlow.bind( this ) );
    }

    initDevice()
    {
        this.getDeviceValues();
    }

    // this method is called when the Homey device has requested a dim level change ( 0 to 1)
    async onCapabilityAirFlow( value, opts )
    {
        var result = "";

        try
        {
            // Homey returns a value of 0 to 1 but the real device requires a value of 0 to 100
            //value *= 100;

            // Get the device information stored during pairing
            const devData = this.getData();

            // Set the air flow Value on the device
            console.log("onCapabilityAirFlow | new flow: ", value,  devData.ip);
            result = await Homey.app.getBridge().setAirFlow( value , devData.ip );
            if ( result != -1 )
            {
                this.setAvailable();
                this.getDeviceValues();
            }
        }
        catch ( err )
        {
            Homey.app.updateLog( this.getName() + " onCapabilityAirFlowChangeError " + err );
        }
    }

    // gets the settings from the device
    async getDeviceValues()
    {
        Homey.app.updateLog("getDeviceValues | " + this.getName() + ': Getting Values' );
        try
        {
            const devData = this.getData();
            const settings = this.getSettings();

            console.log("getDeviceValues | getData(): ", devData);
            console.log("getDeviceValues | getSettings(): ", settings);

            // Get the current position Value from the device using the unique mac stored during pairing
            const airFlow = await Homey.app.getBridge().getAirFlow(devData.ip);

            if ( airFlow >= 0 )
            {
                this.setAvailable();
                await this.setCapabilityValue( 'airflow',  airFlow);
            }
        }
        catch ( err )
        {
            Homey.app.updateLog("getDeviceValues | ", this.getName() + " getDeviceValues Error " + err );
        }
    }
}

module.exports = PwmFan;
