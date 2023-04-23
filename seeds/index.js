require("dotenv").config();

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

const dbUrl = process.env.DB_URL;
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedImages = [
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883435/YelpCamp/vladimir-haltakov-9J4Id8uXcQU-unsplash_jy3ar9.jpg",
    filename: "YelpCamp/vladimir-haltakov-9J4Id8uXcQU-unsplash_jy3ar9",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883433/YelpCamp/brian-yurasits-cAVUdHxLgIw-unsplash_inncyy.jpg",
    filename: "YelpCamp/brian-yurasits-cAVUdHxLgIw-unsplash_inncyy",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883373/YelpCamp/ross-sneddon-mdAulgKywvw-unsplash_ga2yft.jpg",
    filename: "YelpCamp/ross-sneddon-mdAulgKywvw-unsplash_ga2yft",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883368/YelpCamp/tim-foster-gLltPGhWpSY-unsplash_b2ocji.jpg",
    filename: "YelpCamp/tim-foster-gLltPGhWpSY-unsplash_b2ocji",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883307/YelpCamp/chris-holder-uY2UIyO5o5c-unsplash_aw4qhx.jpg",
    filename: "YelpCamp/chris-holder-uY2UIyO5o5c-unsplash_aw4qhx",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883305/YelpCamp/scott-goodwill-y8Ngwq34_Ak-unsplash_n3pux8.jpg",
    filename: "YelpCamp/scott-goodwill-y8Ngwq34_Ak-unsplash_n3pux8",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883305/YelpCamp/rahul-bhosale-yBgC-qVCxMg-unsplash_sayks3.jpg",
    filename: "YelpCamp/rahul-bhosale-yBgC-qVCxMg-unsplash_sayks3",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1621434401/YelpCamp/odztskya3xmhtr1sl6mm.jpg",
    filename: "YelpCamp/odztskya3xmhtr1sl6mm",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883308/YelpCamp/ali-kazal-5eAbyu1zke4-unsplash_mjrmvs.jpg",
    filename: "YelpCamp/ali-kazal-5eAbyu1zke4-unsplash_mjrmvs",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883307/YelpCamp/sikes-photos-CpKYhh1BWYw-unsplash_pppkzj.jpg",
    filename: "YelpCamp/sikes-photos-CpKYhh1BWYw-unsplash_pppkzj",
  },
  {
    url: "https://res.cloudinary.com/dsgvp2wmj/image/upload/v1622883307/YelpCamp/christopher-jolly-gcCcIy6Fc_M-unsplash_rxc7cw.jpg",
    filename: "YelpCamp/christopher-jolly-gcCcIy6Fc_M-unsplash_rxc7cw",
  },
];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random10 = Math.floor(Math.random() * 10);
    const randomImage = seedImages[random10];
    const price = (Math.floor(Math.random() * 20) + 9.99).toFixed(2);
    const camp = new Campground({
      author: process.env.SEED_USER,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Facere eaque nulla quisquam sequi atque obcaecati ipsam recusandae consequatur perspiciatis veniam, reiciendis placeat voluptas quos. Sint molestiae ea laborum quidem perferendis.",
      price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: randomImage.url,
          filename: randomImage.filename,
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
