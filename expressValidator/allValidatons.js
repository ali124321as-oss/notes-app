const { body, validationResult } = require("express-validator");
    const path=require("path")
   const{deleteExtraFiles}=require("../expressValidator/deleteExtraFile")
// 1. Text field validator
function textValidator(fieldName) {
  return body(fieldName).notEmpty().withMessage(`${fieldName} is required `);
}

// 2. Email field validator
function emailValidator(fieldName) {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isEmail()
    .withMessage("Please provide a valid email");
}

// 3. Password field validator
function passwordValidator(fieldName) {
  return body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long");
}

// 4. File field validator
function fileValidator(fieldName) {
  return body(fieldName).custom((value, { req }) => {
    if (!req.file) {
      throw new Error(`${fieldName} is required`);
    }
    return true;
  });
}
const validationMiddleware = (req, res,next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    if (req.file && req.file.filename) {
          deleteExtraFiles(req.file.path)
         
        
    }
      return res.status(400).json({
        errors: errors.array().map((err) => {
          return err.msg;
        }),
      });
  }
  next();
};
module.exports = {
  textValidator,
  emailValidator,
  passwordValidator,
  fileValidator,
  validationMiddleware,
};
