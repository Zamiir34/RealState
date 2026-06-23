const { ErrorResponse } = require('../middleware/errorHandler');

const parsePropertyBody = (body) => {
  const data = { ...body };
  const numbers = ['price', 'bedrooms', 'bathrooms', 'areaSize', 'parkingSpaces', 'latitude', 'longitude', 'yearBuilt'];

  numbers.forEach((key) => {
    if (data[key] !== undefined && data[key] !== '' && data[key] !== null) {
      data[key] = Number(data[key]);
    }
  });

  if (data.propertyType === 'land') {
    data.bedrooms = 0;
    data.bathrooms = 0;
    data.parkingSpaces = data.parkingSpaces || 0;
    data.listingType = 'sale';
    if (!data.areaUnit) data.areaUnit = 'acre';
  }

  return data;
};

const validateLandListing = (data, files, next) => {
  if (data.propertyType !== 'land') return true;

  if (!data.areaSize || data.areaSize <= 0) {
    next(new ErrorResponse('Land size is required', 400));
    return false;
  }
  if (!files?.images?.length) {
    next(new ErrorResponse('Please upload at least one photo of the land', 400));
    return false;
  }
  return true;
};

module.exports = { parsePropertyBody, validateLandListing };
