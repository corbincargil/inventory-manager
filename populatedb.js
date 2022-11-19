#! /usr/bin/env node

console.log(
  "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Product = require("./models/product");
var Manufacturer = require("./models/manufacturer");
var Category = require("./models/category");
var Subcategory = require("./models/subcategory");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var products = [];
var manufacturers = [];
var categories = [];
var subcategories = [];

function manufaturerCreate(name, location, founded, logo, cb) {
  manufacturerDetail = { name: name, location: location };
  if (founded != false) manufacturerDetail.founded = founded;
  if (logo != false) manufacturerDetail.logo = logo;

  var manufacturer = new Manufacturer(manufacturerDetail);

  manufacturer.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Manufacturer: " + manufacturer);
    manufacturers.push(manufacturer);
    cb(null, manufacturer);
  });
}

function categoryCreate(name, cb) {
  var category = new Category({ name: name, subcategories: [] });

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function subcategoryCreate(name, category, cb) {
  var subcategory = new Subcategory({ name: name, category: category });

  subcategory.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Subcategory: " + subcategory);
    subcategories.push(subcategory);
    cb(null, category);
    //need to figure out how to add a subcategory to the subcategories array for its specific category when it is created
    category.subcategories.push(subcategory);
    console.log(`${category.name}'s usbcategories: ${category.subcategories}`);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(category.subcategories);
  });
}

function productCreate(
  name,
  description,
  manufacturer,
  category,
  subcategory,
  price,
  pic,
  inStock,
  qty,
  cb
) {
  productdetail = {
    name: name,
    manufacturer: manufacturer,
    category: category,
    price: price,
    inStock: inStock,
    qty: qty,
  };
  if (description != false) productdetail.description = description;
  if (subcategory != false) productdetail.subcategory = subcategory;
  if (pic != false) productdetail.pic = pic;

  var product = new Product(productdetail);
  product.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Product: " + product);
    products.push(product);
    cb(null, product);
  });
}

function createCategoriesManufacturers(cb) {
  async.series(
    [
      function (callback) {
        manufaturerCreate(
          "Sig Sauer, Inc.",
          "Newington, New Hampshire, United States",
          "2007-10-01",
          false,
          callback
        );
      },
      function (callback) {
        categoryCreate("Firearms", callback);
      },
    ],
    // optional callback
    cb
  );
}

function createProducts(cb) {
  async.parallel(
    [
      function (callback) {
        productCreate(
          "Sig Sauer 9MM P365XL",
          "Cool gun go PEW! PEW!",
          manufacturers[0],
          categories[0],
          false,
          499.99,
          false,
          true,
          10,
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createSubcategories(cb) {
  async.parallel(
    [
      function (callback) {
        subcategoryCreate("Handguns", categories[0], callback);
      },
    ],
    // Optional callback
    cb
  );
}

// function populateSubcategories(cb) {
//   async.series(
//     [
//       function (cb) {
//         subcategories.forEach((subcategory) => {
//           categories.forEach((category) => {
//             if (subcategory.category === category) {
//               category.subcategories.push(subcategory);
//               return;
//             } else {
//               cb(null);
//               return;
//             }
//           });
//         });
//       },
//     ],
//     cb
//   );
// }

async.series(
  [createCategoriesManufacturers, createProducts, createSubcategories],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Subcategoires: " + subcategories);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
