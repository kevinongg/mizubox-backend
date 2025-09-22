import db from "#db/client";

import { faker } from "@faker-js/faker";
import { createUser } from "./queries/users.js";
import { createNigiri } from "./queries/nigiris.js";
import {
  addNigiriToPreMadeBox,
  createPreMadeBox,
} from "./queries/preMadeBoxes.js";
import {
  addExtraToUserCustomBox,
  addNigiriToUserCustomBox,
  addSauceToUserCustomBox,
  createUserCustomBox,
} from "./queries/UserCustomBoxes.js";
import { addItemToCart, createCart } from "./queries/cart.js";
import {
  addOrderItemBox,
  addOrderItemExtra,
  addOrderItemNigiri,
  addOrderItemSauce,
  createOrder,
} from "./queries/orders.js";
import { createSauce } from "./queries/sauces.js";
import { createExtra } from "./queries/extras.js";

const seed = async () => {
  //*** Create 2 test users ***//
  let users = [];
  for (let i = 0; i < 2; i++) {
    const user = await createUser(
      faker.person.fullName(),
      faker.internet.exampleEmail(),
      faker.word.noun(),
      "user"
    );
    users.push(user);
  }

  //======================================================================================================

  //*** Create a couple of nigiris ***//
  const nigiriList = [
    {
      name: "Chutoro",
      category: "fish",
      description: "Fatty tuna from japan",
      imageUrl:
        "https://thejapanesebar.com/wp-content/uploads/2021/08/PXL_20210720_003439661-Chu-Toro-WEB1000-930x500.jpg",
      price: 9.0,
      available: true,
    },
    {
      name: "O-Toro",
      category: "fish",
      description: "Fatty tuna from japan",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpRLRoyFT35-QIi7XnOQ3yvUOS3V6GoLjlow&s",
      price: 11.0,
      available: true,
    },
    {
      name: "Sake",
      category: "fish",
      description: "King salmon from new zealand",
      imageUrl:
        "https://bentosushi.lv/image/cache/catalog/products/Sake-nigiri-800x557.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Uni",
      category: "shellfish",
      description: "Hokkaido uni from japan",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyVt7BfosNLJKci4jpfOc-W6vOueWmCiz0Eg&s",
      price: 15.0,
      available: true,
    },
    {
      name: "A5 wagyu",
      category: "beef",
      description: "A5 wagyu from japan",
      imageUrl:
        "https://s3-media0.fl.yelpcdn.com/bphoto/_pOvjO-ekV7xe2H6fuvHEw/258s.jpg",
      price: 15.0,
      available: true,
    },
  ];

  let nigiris = [];
  for (const item of nigiriList) {
    const nigiri = await createNigiri(
      item.name,
      item.category,
      item.description,
      item.imageUrl,
      item.price,
      item.available
    );
    nigiris.push(nigiri);
  }

  //======================================================================================================

  //*** Create a couple of sauces ***//
  const sauceList = [
    {
      name: "Koikuchi Soy Sauce",
      description:
        "Shimanto Domeki’s soy sauce infused with Japanese dashi soda katsuo (large shavings of bonito flakes) and koikuchi (full-bodied), creating an umami-rich soy sauce.",
      imageUrl:
        "https://shop.yamaseafood.com/cdn/shop/files/Koikuchi.png?v=1743499072&width=1100",
      price: 12.5,
    },
    {
      name: "Yuzu Kosho",
      description:
        "A unique sauce combining the citrusy heat of yuzu kosho (a fermented chili and citrus paste)",
      imageUrl: "https://m.media-amazon.com/images/I/71b6Tznyk2L._SL1500_.jpg",
      price: 21.97,
    },
    {
      name: "Chili Crisp",
      description:
        "A flavorful condiment with a satisfying crunch, made from chili peppers and various spices.",
      imageUrl: "https://m.media-amazon.com/images/I/61RSoIGGXeL._SL1000_.jpg",
      price: 19.5,
    },
  ];

  let sauces = [];
  for (const item of sauceList) {
    const sauce = await createSauce(
      item.name,
      item.description,
      item.imageUrl,
      item.price
    );
    sauces.push(sauce);
  }

  //======================================================================================================

  //*** Create a couple of extras ***//
  const extraList = [
    {
      name: "Udama (Quail Eggs)",
      description:
        "Udama (Quail Eggs) we source are from California. Produced by a very well respected farm. 10pc per pack.",
      imageUrl:
        "https://shop.yamaseafood.com/cdn/shop/products/Udama_QuailEggs-684941.png?v=1707412584&width=493",
      price: 2.95,
    },
    {
      name: "Hon Wasabi",
      description:
        "Called `Real Wasabi` Is made from high quality wasabi grown at Shizuoka.",
      imageUrl:
        "https://shop.yamaseafood.com/cdn/shop/files/WebsitePhotos_eea024d3-17f8-4843-a939-01ddf380a4e6.png?v=1743427015&width=493",
      price: 7.0,
    },
    {
      name: "Fresh Burgundy Black Truffle",
      description:
        "Burgundy Truffles have an intense, hazelnut-like aroma and are highly prized for their gastronomic qualities. They are used in the haute cuisine of France and Italy, as well as a substitute for the Périgord black truffle (T. melanosporum).",
      imageUrl:
        "https://shop.yamaseafood.com/cdn/shop/products/FreshBurgundyBlackTruffle_TuberUncinatum-450954.png?v=1707412525&width=493",
      price: 50,
    },
  ];

  const extras = [];
  for (const item of extraList) {
    const extra = await createExtra(
      item.name,
      item.description,
      item.imageUrl,
      item.price
    );
    extras.push(extra);
  }

  // //======================================================================================================

  //*** Create pre-made mizubox ***//
  const preMade = await createPreMadeBox(
    "Chef's Choice 14",
    "14 pieces featuring daily catch",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ5nBaf-V43FujPdINAJJaSQQ5z-aUIUcMcA&s",
    80.0
  );
  //*** Assign nigiri into created mizubox ***//
  await addNigiriToPreMadeBox(preMade.id, nigiris[0].id, 5);
  await addNigiriToPreMadeBox(preMade.id, nigiris[1].id, 5);
  await addNigiriToPreMadeBox(preMade.id, nigiris[2].id, 4);

  // //======================================================================================================

  //*** Create custom box ***//
  const customBox = await createUserCustomBox(users[0].id);
  //*** Assign nigiri to created custom box ***//
  await addNigiriToUserCustomBox(customBox.id, nigiris[0].id, 4);
  await addNigiriToUserCustomBox(customBox.id, nigiris[1].id, 4);
  await addNigiriToUserCustomBox(customBox.id, nigiris[2].id, 4);
  await addNigiriToUserCustomBox(customBox.id, nigiris[3].id, 2);
  //*** Assign sauce to created custom box ***//
  await addSauceToUserCustomBox(customBox.id, sauces[0].id, 2);
  await addSauceToUserCustomBox(customBox.id, sauces[1].id, 1);
  await addSauceToUserCustomBox(customBox.id, sauces[2].id, 3);
  //*** Assign extra to created custom box ***//
  await addExtraToUserCustomBox(customBox.id, extras[0].id, 3);
  await addExtraToUserCustomBox(customBox.id, extras[1].id, 2);
  await addExtraToUserCustomBox(customBox.id, extras[2].id, 1);

  //======================================================================================================

  //*** Create cart ***//
  const cart = await createCart(users[0].id);
  //*** add item to cart
  await addItemToCart(cart.id, "pre-made", preMade.id, 1);
  await addItemToCart(cart.id, "custom", customBox.id, 1);

  //======================================================================================================

  //*** Create order ***//
  const order = await createOrder(users[0].id, 200.0);
  //*** Add box to order ***//
  const orderPreMade = await addOrderItemBox(
    order.id,
    "pre-made",
    preMade.id,
    1
  );
  const orderCustom = await addOrderItemBox(
    order.id,
    "custom",
    customBox.id,
    1
  );
  //*** Add nigiris to order referencing custom box ***//
  await addOrderItemNigiri(orderCustom.id, nigiris[0].id, 7);
  await addOrderItemNigiri(orderCustom.id, nigiris[1].id, 7);
  //*** Add sauces to order referencing custom box ***//
  await addOrderItemSauce(orderCustom.id, sauces[0].id, 2);
  await addOrderItemSauce(orderCustom.id, sauces[1].id, 1);
  //*** Add extras to order referencing custom box ***//
  await addOrderItemExtra(orderCustom.id, extras[0].id, 1);
  await addOrderItemExtra(orderCustom.id, extras[1].id, 2);
};

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");
