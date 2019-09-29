const validator = require('password-validator');
const { check, validationResult } = require('express-validator');

var schema = new validator();
schema.is().min(8);
schema.is().max(20);
schema.has().uppercase();
schema.has().lowercase();
schema.has().digits();
schema.has().not().spaces();
schema.has().symbols();

let validateRecipe = [
    check('id').not().exists(), check('created_ts').not().exists(),
    check('updated_ts').not().exists(), check('author_id').not().exists(),
    check('total_time_in_min').not().exists(),   
    check('cook_time_in_min').exists().isInt({min:5}).isDivisibleBy(5),
    check('prep_time_in_min').exists().isInt({min:5}).isDivisibleBy(5),
    check('title').exists().isString().trim().not().isEmpty(), 
    check('cusine').exists().isString().trim().not().isEmpty(),
    check('servings').exists().isInt({min:1,max:5}),
    check('ingredients').exists().isArray().not().isEmpty()
    .custom((value, { req }) => {
        for(let i=0;i<value.length;i++) {
            value[i] = value[i].replace(/\s/g,' ');
        }
        return value.length>1?(new Set(value.map(Function.prototype.call, String.prototype.trim))).size === value.length : true;
    }),
    check('steps').exists().isArray().not().isEmpty(),
    check('steps.*.position').exists().not().isEmpty().isInt({min:1}),
    check('steps.*.items').exists().isString().trim().not().isEmpty(),
    check('nutrition_information').exists().not().isEmpty(),
    check('nutrition_information.calories').exists().not().isEmpty().isInt({min:0}),
    check('nutrition_information.cholesterol_in_mg').exists().not().isEmpty().isFloat({min:0}),
    check('nutrition_information.sodium_in_mg').exists().not().isEmpty().isInt({min:0}),
    check('nutrition_information.carbohydrates_in_grams').exists().not().isEmpty().isFloat({min:0}),
    check('nutrition_information.protein_in_grams').exists().not().isEmpty().isFloat({min:0})
   ];

module.exports = {
    schema,
    validateRecipe
};

