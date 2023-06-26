const LED_SERVICE_UUID = 0x3785;
const LED_CHAR_UUID = 0x2161;

var ledChar = null;
export var isConnected = false;

let encoder = new TextEncoder('utf-8');

export async function connectBT() {
    try {    
        const bleDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [LED_SERVICE_UUID]
        });
        const server = await bleDevice.gatt.connect();
        bleDevice.addEventListener('gattserverdisconnected', async function (event) {
            isConnected = false;
        });
        const ledService = await server.getPrimaryService(LED_SERVICE_UUID);
        ledChar = await ledService.getCharacteristic(LED_CHAR_UUID);
        isConnected = true;
    } catch (error) {
        console.error(error);
        isConnected = false;
    }
}

export function sendData(dataTosend) {
    ledChar.writeValueWithoutResponse(encoder.encode(dataTosend));
}