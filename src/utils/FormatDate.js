export const FormatDate = date => {
  const _date = date.split('/');
  const dateObj = {month: _date[0], day: _date[1], year: _date[2]};
  return dateObj.year + '-' + dateObj.month + '-' + dateObj.day;
};
