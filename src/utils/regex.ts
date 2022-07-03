export const phoneNumberRegExp = (it: string) => {
  const regex2 = /^[0-9 ()+]+$/;
  return it.match(regex2);
};
