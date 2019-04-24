const mcpadc = require('mcp-spi-adc');
const mqtt = require('mqtt');

var client = mqtt.connect('mqtt://localhost:1883');

const channels = {
  x: 0,
  y: 1,
  z: 2
}

const calibrationData = require('./calibration-data');

client.on('connect', () => {
  console.log('MQTT Client Connected');
});

const interval = 100;

var xSensor, ySensor, zSensor;

Promise.all([
  mcpadc.willOpen(0, {}),
  mcpadc.willOpen(1, {}),
  mcpadc.willOpen(2, {})
])
  .then(values => {
    console.log(values);
    xSensor = values[0];
    ySensor = values[1];
    zSensor = values[2];

    setInterval(() => {
      willReadSensors()
        .then(reading => {
          console.log(reading.x);
          let data = {
            type: 'clinometer',
            data: reading
          };

          client.publish('sensor-data', JSON.stringify(data));
        });
    }, interval);
    
  })
  .catch(err => {
    console.log(err);
  });

function willReadSensors() {
  let reading = {};

  return Promise.all([
    xSensor.willRead(),
    ySensor.willRead(),
    zSensor.willRead()
  ])
    .then(values => {
      reading = {
        x: parseInt(translateVoltage(values[0].value, calibrationData.x, true)),
        y: parseInt(translateVoltage(values[1].value, calibrationData.y)),
        z: parseInt(translateVoltage(values[2].value, calibrationData.z))
      };

      return (reading);
    });
};

Math.degrees = function(radians) {
  return radians * 180 / Math.PI
}

function translateVoltage(input, calibration, debug) {
  let offset = (calibration.max + calibration.min) / 2;
  let spread = 0.98 / (calibration.max - offset);

  if (debug) {
    console.log(offset, 0.51);
    console.log(spread, 10);
  }

  let newInput = (input - offset) * spread;
  let normalizedInput = (input - 0.51) * 10;

  if (normalizedInput > 1) {
    normalizedInput = 1;
  } else if (normalizedInput < -1) {
    normalizedInput = -1;
  }

  if (newInput > 1) newInput = 1
  if (newInput < -1) newInput = -1 

  if (debug) {
    console.log(`compareinputs: new: ${newInput}, old: ${normalizedInput}`);
  }

  let output = Math.degrees(Math.asin(normalizedInput));
  // let output = Math.degrees(Math.asin(newInput));
  return output;
}

