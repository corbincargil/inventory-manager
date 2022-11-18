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
  if (founded != false) authordetail.founded = founded;
  if (logo != false) authordetail.logo = logo;

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
    console.log("New Genre: " + category);
    categories.push(category);
    cb(null, subcacategorytegory);
  });
}

function subcategoryCreate(name, category, cb) {
  var subcategory = new Subcategory({ name: name, category: category });

  subcategory.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Genre: " + subcategory);
    subcategories.push(subcategory);
    cb(null, category);
  });

  //need to figure out how to add a subcategory to the subcategories array for its specific category when it is created
  category.subcategories.push(subcategory);
}

function productCreate(
  name,
  descrition,
  manufaturer,
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
    manufaturer: manufaturer,
    category: category,
    price: price,
    inStock: inStock,
    qty: qty,
  };
  if (descrition != false) productdetail.descrition = descrition;
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

function bookInstanceCreate(book, imprint, due_back, status, cb) {
  bookinstancedetail = {
    book: book,
    imprint: imprint,
  };
  if (due_back != false) bookinstancedetail.due_back = due_back;
  if (status != false) bookinstancedetail.status = status;

  var bookinstance = new BookInstance(bookinstancedetail);
  bookinstance.save(function (err) {
    if (err) {
      console.log("ERROR CREATING BookInstance: " + bookinstance);
      cb(err, null);
      return;
    }
    console.log("New BookInstance: " + bookinstance);
    bookinstances.push(bookinstance);
    cb(null, book);
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
          10
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

async.series(
  [createCategoriesManufacturers, createProducts, createSubcategories],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("BOOKInstances: " + bookinstances);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
