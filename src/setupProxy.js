module.exports = function (app) {
  app.use("/", function (req, res, next) {
    res.set({
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    });
    next();
  });
};
