# RadiaCodeCSVConverter
Converts exported CSV files by the RadiaCode-101 pocket gamma spectrometer into XML.

## Prerequisites

* this script needs Node 11+

## Usage
* Clone this repository
* Copy `config.json.sample` to `config.json` and adjust your settings
  * You can find most of the values inside the device settings menu of the [RadiaCode-101 Windows application](https://scan-electronics.com/downloads/radiacode)
* Put all the CSV files you want to convert into the folder `./input`
* Run the script with `npm start` or `node convert.js`
* You can find the converted files in the folder `./output` afterwards

## Configuration

The `config-sample.json` contains everything you need to setup a `config.json` for a single webhook endpoint deploying multiple projects:

```json
{
  "serialnumber": "RC-101-000000",
  "coefficients": [
    0.193228,
    9.5851,
    0.00662241
  ],
  "devicename": "RadiaCode-101",
  "polynomialorder": 2,
  "formatversion": 120920,
  "channels": 256
}
```

| Setting                      | Description                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `serialnumber`                | The serial number of your device (change this to your value if you feel like it) |
| `coefficients`                | The calibration coefficients of your device, which can be found in the Android and Windows applications |
| `devicename`                  | The device model (doesn't need to be changed)                               |
| `polynomialorder`             | The device's polynomial order setting (doesn't need to be changed)          |
| `formatversion`               | The current XML format version (doesn't need to be changed)                 |
| `channels`                    | The channels to display, for the RadiaCode-101 this is 256 for now and doesn't need to be changed |