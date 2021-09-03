import fs from 'fs';
const fsPromises = fs.promises;

const readFile = async (path) => {
  try {
    return fsPromises.readFile(`${path}`);
  } catch (error) {
    console.error(error);
  }
}

const writeFile = async (path, content) => {
  try {
    return fsPromises.writeFile(`${path}`, content);
  } catch (error) {
    console.error(error);
  }
}

const listDir = async (dir) => {
  try {
    return fsPromises.readdir(dir);
  } catch (err) {
    console.error('Error occured while reading directory!', err);
  }
}

const readFiles = async (paths) => {
  const fileList = await listDir("./input");
  let result = {};

  // Put all promises in a map so they can be resolved nicely 
  // while also putting them in the result object.
  const fileOps = fileList.map(async (el) => {
    // keep out non-csv files
    if (!~el.indexOf('.csv')) {
      return;
    }

    const name = el.replace('.csv', '')
    
    const promise = await readFile(`./input/${el}`);
    result[name] = promise.toString().split(/\r?\n/);
    
    return promise;
  });
  
  // Wait for it...
  await Promise.all(fileOps)
  
  // ...and just return the finished object.
  return result;
}

const writeFiles = async (files) => {
  Object.keys(files).forEach(async el => {
    writeFile(`./output/${el}`, files[el]);
  })
}

const filterFiles = (parsedFiles) => {
  Object.keys(parsedFiles).forEach(file => {
    parsedFiles[file].forEach((el, i) => {
      parsedFiles[file][i] = el.replace(/\d+,/g, '');
    })
  })
  
  return parsedFiles;
}

const destructFilename = (filename) => {
  // let name,
  //     measurementTime;

  const dataset = filename.split('-t');

  if (dataset.length < 2) {
    throw new Error("Filename does not contain a measurement time!");
  }

  return [dataset[0], dataset[1]];
}

const prepareXML = async (filteredFiles) => {
  let result = {};
  let xmlTemplate = await readFile(`template.xml`);
  xmlTemplate = xmlTemplate.toString();
  
  Object.keys(filteredFiles).forEach(el => {
    let preparedText = xmlTemplate;
    let configCoefficients = '',
        formatVersion,
        deviceName, 
        spectrumName,
        serialNumber,
        channels, 
        polynomialOrder, 
        csvDataPoints = '',
        measurementTime = 0,
        filename;
    
    try {
      [filename, measurementTime] = destructFilename(el);
    } catch (error) {
      console.error(error.message);
    }
    
    config.coefficients.forEach(coefficient => {
      configCoefficients += `<Coefficient>${coefficient}</Coefficient>\n`;
    })
    
    formatVersion = `<FormatVersion>${config.formatversion}</FormatVersion>`;
    measurementTime = `<MeasurementTime>${measurementTime}</MeasurementTime>`;
    deviceName = `<Name>${config.devicename}</Name>`;
    serialNumber = `<SerialNumber>${config.serialnumber}</SerialNumber>`;
    channels = `<NumberOfChannels>${config.channels}</NumberOfChannels>`;
    polynomialOrder = `<PolynomialOrder>${config.polynomialorder}</PolynomialOrder>`;
    spectrumName = `<SpectrumName>${filename}</SpectrumName>`;
    filteredFiles[el].forEach(datapoint => {
      if (datapoint) {
        csvDataPoints += `<DataPoint>${datapoint}</DataPoint>\n`;
      }
    })
  
    preparedText = preparedText
    .replace('<FormatVersion />', formatVersion)
    .replace('<MeasurementTime />', measurementTime)
    .replace('<Name />', deviceName)
    .replace('<NumberOfChannels />', channels)
    .replace('<SpectrumName />', spectrumName)
    .replace('<SerialNumber />', serialNumber)
    .replace('<PolynomialOrder />', polynomialOrder)
    .replace('<ConfigCoefficients />', configCoefficients)
    .replace('<CSVDataPoints />', csvDataPoints);
    
    result[`${filename}.xml`] = preparedText;
  });

  return result;
}

let configStream;

try {
  configStream = await readFile('config.json');
} catch (error) {
  console.info(`Note: Please make sure you created the config.json as defined in the documentation.`);
  console.error(`Message: ${error.message}`);
  process.exit(1);
}
const config = JSON.parse(configStream.toString());

const files = await readFiles();
const filteredFiles = filterFiles(files);
const preparedXML = await prepareXML(filteredFiles);

writeFiles(preparedXML);