const getFunction = (data: string) => {
  return eval(data) as any; // eslint-disable-line
};

export default getFunction;
