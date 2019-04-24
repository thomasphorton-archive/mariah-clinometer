const fs = require('fs');
const mcpadc = require('mcp-spi-adc');

const channels = {
  x: 0,
  y: 1,
  z: 2
};

const interval = 100;

const calibrationData = {
  x: {
    min: undefined,
    max: undefined
  },
  y: {
    min: undefined,
    max: undefined
  },
  z: {
    min: undefined,
    max: undefined
  }
};

const xSensor = mcpadc.open(channels.x, {}, (err) => {
  if (err) throw err;

  setInterval(() => {
    xSensor.read((err, reading) => {
      if (err) throw err;

      if (!calibrationData.x.min || reading.value < calibrationData.x.min) calibrationData.x.min = reading.value
      if (!calibrationData.x.max || reading.value > calibrationData.x.max) calibrationData.x.max = reading.value
    });
  }, interval);
});

const ySensor = mcpadc.open(channels.y, {}, (err) => {
  if (err) throw err;
 
  setInterval(() => {
    ySensor.read((err, reading) => {
      if (err) throw err;

      if (!calibrationData.y.min || reading.value < calibrationData.y.min) calibrationData.y.min = reading.value
      if (!calibrationData.y.max || reading.value > calibrationData.y.max) calibrationData.y.max = reading.value
    });
  }, interval);
});

const zSensor = mcpadc.open(channels.z, {}, (err) => {
  if (err) throw err;

  setInterval(() => {
    zSensor.read((err, reading) => {
      if (err) throw err;

      if (!calibrationData.z.min || reading.value < calibrationData.z.min) calibrationData.z.min = reading.value
      if (!calibrationData.z.max || reading.value > calibrationData.z.max) calibrationData.z.max = reading.value
    });
  }, interval);
});

setInterval(() => {
  console.log(calibrationData);
  fs.writeFileSync('./calibration-data.json', JSON.stringify(calibrationData, null, 2));
}, interval)
