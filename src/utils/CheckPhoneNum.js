export const CheckPhoneNum = hpNum => {
  var re = /^(|8|9)\d{7}$/;
  return re.test(hpNum);
};
