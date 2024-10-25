import {
  createDateValidatorChain,
  createDecimalValidatorChain,
  createIdValidatorChain,
  createNameValidatorChain,
} from './index.js';

export const validateCityId = [...createIdValidatorChain('id')];

export const validateCityPost = [
  ...createNameValidatorChain('name'),
  ...createDateValidatorChain('established'),
  ...createDecimalValidatorChain('averageTemp', 3, 1),
];

export const validateCityPut = [...validateCityPost, ...validateCityId];
