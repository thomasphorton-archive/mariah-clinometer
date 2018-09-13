const mcpadc = require('mcp-spi-adc');
const mqtt = require('mqtt');

var client = mqtt.connect('mqtt://localhost:1883');

const channels = {
  x: 0,
  y: 1,
  z: 2
}

const interval = 1000;

var xSensor, ySensor, zSensor;

Promise.all([
  mcpadc.willOpen(0, {}),
  mcpadc.willOpen(1, {}),
  mcpadc.willOpen(2, {})
])
  .then(values => {
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
        x: translateVoltage(values[0].value),
        y: translateVoltage(values[1].value),
        z: translateVoltage(values[2].value)
      };

      return (reading);
    });
};

Math.degrees = function(radians) {
  return radians * 180 / Math.PI
}
// arcos for z
function translateVoltage(input) {
  let normalizedInput = (input - 0.51) * 10;
  if (normalizedInput > 1) {
    normalizedInput = 1;
  } else if (normalizedInput < -1) {
    normalizedInput = -1;
  }

  let output = Math.degrees(Math.asin(normalizedInput));
  return output;
}

