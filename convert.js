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
        csvDataPoints = '';

    config.coefficients.forEach(coefficient => {
      configCoefficients += `<Coefficient>${coefficient}</Coefficient>\n`;
    })

    formatVersion = `<FormatVersion>${config.formatversion}</FormatVersion>`;
    deviceName = `<Name>${config.devicename}</Name>`;
    serialNumber = `<SerialNumber>${config.serialnumber}</SerialNumber>`;
    channels = `<Channels>${config.channels}</Channels>`;
    polynomialOrder = `<NumberOfChannels>${config.polynomialorder}</NumberOfChannels>`;
    spectrumName = `<SpectrumName>${el}</SpectrumName>`;
    filteredFiles[el].forEach(datapoint => {
      csvDataPoints += `<DataPoint>${datapoint}</DataPoint>\n`;
    })

    preparedText = preparedText
      .replace('<Name />', deviceName)
      .replace('<NumberOfChannels />', channels)
      .replace('<SpectrumName />', spectrumName)
      .replace('<SerialNumber />', serialNumber)
      .replace('<PolynomialOrder />', polynomialOrder)
      .replace('<ConfigCoefficients />', configCoefficients)
      .replace('<CSVDataPoints />', csvDataPoints);

    result[`${el}.xml`] = preparedText;
  });

  return result;
}

let configStream = await readFile('config.json');
const config = JSON.parse(configStream.toString());

const files = await readFiles();
const filteredFiles = filterFiles(files);
const preparedXML = await prepareXML(filteredFiles);

writeFiles(preparedXML);