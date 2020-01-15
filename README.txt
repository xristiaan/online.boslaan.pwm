# online.boslaan.pwmfan

This app is for a PWM controlled home ventilation fan

# How does it work
The controller connects via a REST API to the PWM controller (on a Particle Argon Baord)

# Currently supported:
* PWM Fan Control

# Future functionality
* Temperature measurement
* Humidity measurement
* Backup autonomous operation based on humidity in ventilation air, with target humidity settings

## Capabilities
* Off
* Air Flow Rate

# Flows:
## Triggers
* Humidity change
* Temperature change

## Conditions:
* Air Flow Rate
* Humidity

## Then:
* Set Position to

# Configuration
* Assign a fixed IP address to the controller. You can typically do this in the DHCP settings of your internet Router where you can assign a fixed IP address for the MAC address of the PWM controller board.
* Specify the IP address of your controller hub in the App settings page

# Notes
Currently only supports one controller

# Version Log

## 0.0.1
* first beta
