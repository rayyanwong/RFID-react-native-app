import {CheckNric} from './CheckNric';
import {CheckPhoneNum} from './CheckPhoneNum';

export const validInputData = (name, nric, hp) => {
  return (
    name !== '' &&
    nric !== '' &&
    hp !== '' &&
    CheckNric(nric) &&
    CheckPhoneNum(hp)
  );
};
