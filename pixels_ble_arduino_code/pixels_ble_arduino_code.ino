#include <Adafruit_NeoPixel.h>
#include <NimBLEDevice.h>

#define DEBUG false
#define PIXEL_PIN 6

Adafruit_NeoPixel pixels(5, PIXEL_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel statusPixel(1, 8, NEO_GRB + NEO_KHZ800);

uint16_t connHandle;
NimBLEServer *bleServerGlobal;
NimBLECharacteristic *ledChar;

String ledsToGlow;

void updateStatusPixel(int r, int g, int b) {
  statusPixel.setPixelColor(0, r, g ,b);
  statusPixel.show();
}

void setPixelsUpto(int num) {
  for(int i = 0; i < num; i++) {
    pixels.setPixelColor(i, 0, 25, 25);
  }
  for(int i = num; i < 5; i++) {
    pixels.setPixelColor(i, 0, 0, 0);
  }
  pixels.show();
}

class serverCallbacks: public NimBLEServerCallbacks {
  void onConnect(NimBLEServer *bleServer, ble_gap_conn_desc *desc) { 
    if(DEBUG) {
      Serial.println("Connected to client");
      Serial.print("Client address: ");
      Serial.println(NimBLEAddress(desc->peer_ota_addr).toString().c_str());
      Serial.print("Connection Handle: ");
      connHandle = desc->conn_handle;
      Serial.println(connHandle);
    }
    NimBLEDevice::stopAdvertising();
    updateStatusPixel(0, 25, 0);
  }

  void onDisconnect(NimBLEServer *bleServer) {
    if(DEBUG) {
      Serial.println("Disconnected from client");
    }
    NimBLEDevice::startAdvertising();
    updateStatusPixel(0, 0, 25);
    setPixelsUpto(0);
    ledsToGlow = "null";
  }
};

class ledCharCallbacks: public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *bleCharacteristic) {
    ledsToGlow = bleCharacteristic->getValue().c_str();
    if(DEBUG) {
      Serial.print("LEDs TO GLOW: ");Serial.println(ledsToGlow);
    }
  }
};

void setup() {
  if(DEBUG) {
    Serial.begin(115200);
  }
  statusPixel.begin();
  updateStatusPixel(0, 0, 25);
  pixels.begin();
  pixels.clear();
  pixels.show();
  NimBLEDevice::init("RSWM");
  NimBLEDevice::setPower(ESP_PWR_LVL_P9, ESP_BLE_PWR_TYPE_ADV);
  NimBLEDevice::setSecurityAuth(false, false, true);
  NimBLEServer *bleServer = NimBLEDevice::createServer();
  bleServerGlobal = bleServer;
  bleServer->setCallbacks(new serverCallbacks());
  NimBLEService *ledService = bleServer->createService("3785");
  ledChar = ledService->createCharacteristic("2161", NIMBLE_PROPERTY::WRITE);
  ledChar->setCallbacks(new ledCharCallbacks());
  ledService->start();
  NimBLEAdvertising *bleAdvertising = NimBLEDevice::getAdvertising();
  bleAdvertising->addServiceUUID("3785");
  bleAdvertising->start();
}

void loop() {
  if(ledsToGlow == "one") {
    setPixelsUpto(1);
  } else if(ledsToGlow == "two") {
    setPixelsUpto(2);
  } else if(ledsToGlow == "three") {
    setPixelsUpto(3);
  } else if(ledsToGlow == "four") {
    setPixelsUpto(4);
  } else if(ledsToGlow == "five") {
    setPixelsUpto(5);
  } else if(ledsToGlow == "stop") {
    setPixelsUpto(0);
  }
}
