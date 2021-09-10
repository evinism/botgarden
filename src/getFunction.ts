const getFunction = (data: string, outVar = "score") => {
  return eval(data + ";(" + outVar + ");") as any; // eslint-disable-line
};

export default getFunction;
