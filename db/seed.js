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
import {
  addExtraToCart,
  addItemToCart,
  addSauceToCart,
  createCart,
} from "./queries/cart.js";
import {
  addOrderItem,
  addOrderItemExtra,
  addOrderItemSauce,
  // addOrderItem,
  // addOrderItemExtra,
  // addOrderItemNigiri,
  // addOrderItemSauce,
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
      "password"
    );
    users.push(user);
  }

  //======================================================================================================

  //*** Create a couple of nigiris ***//
  const nigiriList = [
    {
      name: "Akami",
      category: "fish",
      description: "Lean tuna",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747824/tuna_e9etdf.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Chu-Toro",
      category: "fish",
      description: "Medium fatty tuna w/ pickled wasabi",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747819/chutoro_gtr2aa.jpg",
      price: 9.0,
      available: true,
    },
    {
      name: "O-toro",
      category: "fish",
      description: "Fatty tuna w/ caviar",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747822/otoro_with_caviar_jozbzl.jpg",
      price: 10.0,
      available: true,
    },
    {
      name: "Sake",
      category: "fish",
      description: "King Salmon w/ sea salt",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747820/salmon_mml3ap.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Kanpachi",
      category: "fish",
      description: "Yellowtail w/ pickled jalapeno",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747824/Yellowtail_amberjack_with_pickled_jalape%C3%B1o_riajdd.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Madai",
      category: "shellfish",
      description: "Sea scallop w/ lime zest & charcoal salt",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759762363/Madai_Japanese_Red_Sea_Bream_w_yuzu_pepper_sauce_agynxu.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Botan Ebi",
      category: "shellfish",
      description: "Blanched spot prawn",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759763467/botan_ebi_pele2p.jpg",
      price: 10.0,
      available: true,
    },
    {
      name: "Hokkaido Uni",
      category: "shellfish",
      description: "Sea Urchin from japan",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747820/hokkaido_uni_tad4gd.jpg",
      price: 15.0,
      available: true,
    },
    {
      name: "A5 Miyazaki Wagyu",
      category: "beef",
      description: "A5 wagyu w/ yuzu pepper paste",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759762363/A5_wagyu_beef_with_yuzu_pepper_paste_b8xmty.jpg",
      price: 12.0,
      available: true,
    },
    {
      name: "Sawara",
      category: "fish",
      description: "Smoked spanish mackerel",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747819/Spanish_mackerel_d2sojo.jpg",
      price: 9.0,
      available: true,
    },
    {
      name: "Unagi",
      category: "fish",
      description: "Freshwater eel w/ foie gras",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747820/unagi_with_foie_gras_lh2hia.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Ikura",
      category: "fish",
      description: "Salmon roe",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759762363/ikura_ftfh45.jpg",
      price: 8.0,
      available: true,
    },
    {
      name: "Saba",
      category: "fish",
      description: "Blue mackerel",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747823/something_trthtc.jpg",
      price: 10.0,
      available: true,
    },
    {
      name: "Kinmedai",
      category: "fish",
      description: "Golden-eyed snapper",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747821/kinmedai_pswfmr.jpg",
      price: 8.0,
      available: true,
    },
    {
      name: "Iwana",
      category: "fish",
      description: "Arctic char w/ miso soybean paste",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747821/Arctic_char_topped_with_miso_soybean_paste_se5xpq.jpg",
      price: 8.0,
      available: true,
    },
    {
      name: "Fluke",
      category: "fish",
      description: "Flounder w/ ponzo radish scallion",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759747822/Japanese_Flounder_w_ponzu_radish_scallion_l4s3bj.jpg",
      price: 7.0,
      available: true,
    },
    {
      name: "Tarabagani",
      category: "shellfish",
      description: "King crab",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759762366/king_crab_wp1cfe.jpg",
      price: 14.0,
      available: true,
    },
    {
      name: "Hotaru",
      category: "fish",
      description: "Firefly squid w/ shiso leaf & miso vinegar",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759762364/Firefly_squid_w_shiso_leaf_miso_vinegar_tjjnnh.jpg",
      price: 8.0,
      available: true,
    },
    {
      name: "Sablefish",
      category: "fish",
      description: "Black cod",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759764380/sablefish_black_cod_jogufr.jpg",
      price: 8.0,
      available: true,
    },
    {
      name: "Shima Aji",
      category: "fish",
      description: "Striped Jack w/ yuzu paste",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759764495/shimaaji_ztiisy.jpg",
      price: 8.0,
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
    {
      name: "Hokkaido Uni",
      description:
        "Hokkaido Uni is considered by many to be the best uni in the world. The Uni (Sea Urchin) from Hokkaido feed on the plentiful Kombu (kelp) in the area, gaining a rich and deep umami flavor.",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759765937/176313597_3897429473644896_3982068226743707469_n_f7dl8d.jpg",
      price: 200,
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
  const preMadeList = [
    {
      name: "Chef's Choice 14",
      description: "14 pieces featuring daily catch",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ5nBaf-V43FujPdINAJJaSQQ5z-aUIUcMcA&s",
      price: 80.0,
    },
    {
      name: "O-toro Lover",
      description: "14 pieces featuring Fatty Tuna",
      imageUrl:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ5nBaf-V43FujPdINAJJaSQQ5z-aUIUcMcA&s",
      price: 110.0,
    },
    {
      name: "King Salmon Lover",
      description: "14 pieces featuring King Salmon",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759766922/121408915_201609601362253_328270102579773073_n_boupmt.jpg",
      price: 80.0,
    },
    {
      name: "Summer Box",
      description:
        "14 pieces featuring Madagascar Tiger Prawn(×4), Santa Barbara Uni(×2), Chu-Toro(×2)",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759766985/116589506_107946874261170_2996731863533264576_n_ddgpw8.jpg",
      price: 100.0,
    },
    {
      name: "*SEASONAL LIMITED*  Autumn Box",
      description:
        "A seasonal omakase selection showcasing the warmth of autumn flavors",
      imageUrl:
        "https://res.cloudinary.com/dj1m8yp37/image/upload/v1759767703/autumn_box_bey0pi.jpg",
      price: 120.0,
    },
  ];

  const preMadeBoxes = [];
  for (const item of preMadeList) {
    const preMadeBox = await createPreMadeBox(
      item.name,
      item.description,
      item.imageUrl,
      item.price
    );
    preMadeBoxes.push(preMadeBox);
  }
  //*** Assign nigiri into created Chef's Choice 14 ***//
  await addNigiriToPreMadeBox(preMadeBoxes[0].id, nigiris[0].id, 5);
  await addNigiriToPreMadeBox(preMadeBoxes[0].id, nigiris[1].id, 5);
  await addNigiriToPreMadeBox(preMadeBoxes[0].id, nigiris[2].id, 4);
  //*** Assign nigiri into created O-toro Lover ***//
  await addNigiriToPreMadeBox(preMadeBoxes[1].id, nigiris[2].id, 14);
  //*** Assign nigiri into created King Salmon Lover ***//
  await addNigiriToPreMadeBox(preMadeBoxes[2].id, nigiris[3].id, 14);
  //*** Assign nigiri into created Summer Box ***//
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[4].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[5].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[6].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[7].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[8].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[9].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[10].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[11].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[12].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[13].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[14].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[15].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[16].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[3].id, nigiris[17].id, 1);
  //*** Assign nigiri into created Autumn Box ***//
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[5].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[19].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[18].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[17].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[16].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[15].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[14].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[12].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[11].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[10].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[9].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[8].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[7].id, 1);
  await addNigiriToPreMadeBox(preMadeBoxes[4].id, nigiris[6].id, 1);

  // //======================================================================================================

  //*** Create custom box ***//
  const customBox = await createUserCustomBox(users[0].id);
  //*** Assign nigiri to created custom box ***//
  await addNigiriToUserCustomBox(customBox.id, nigiris[0].id);
  await addNigiriToUserCustomBox(customBox.id, nigiris[1].id);
  await addNigiriToUserCustomBox(customBox.id, nigiris[2].id);
  await addNigiriToUserCustomBox(customBox.id, nigiris[3].id);
  //*** Assign sauce to created custom box ***//
  await addSauceToUserCustomBox(customBox.id, sauces[0].id);
  await addSauceToUserCustomBox(customBox.id, sauces[1].id);
  await addSauceToUserCustomBox(customBox.id, sauces[2].id);
  //*** Assign extra to created custom box ***//
  await addExtraToUserCustomBox(customBox.id, extras[0].id);
  await addExtraToUserCustomBox(customBox.id, extras[1].id);
  await addExtraToUserCustomBox(customBox.id, extras[2].id);

  //======================================================================================================

  //*** Create cart ***//
  const cart = await createCart(users[0].id);
  //*** add item to cart
  await addItemToCart(cart.id, "pre-made", preMadeBoxes[0].id, 1);
  await addItemToCart(cart.id, "custom", customBox.id, 1);
  //*** add sauce to cart
  await addSauceToCart(cart.id, sauces[0].id);
  await addSauceToCart(cart.id, sauces[1].id);
  //*** add extra to cart
  await addExtraToCart(cart.id, extras[0].id);
  await addExtraToCart(cart.id, extras[1].id);

  //======================================================================================================

  //*** Create order ***//
  const order = await createOrder(users[0].id, 200.0);
  //*** Add item to order ***//
  await addOrderItem(order.id, "pre-made", preMadeBoxes[0].id, 1);
  await addOrderItem(order.id, "custom", customBox.id, 1);
  // //*** Add sauces to order ***//
  await addOrderItemSauce(order.id, sauces[0].id, 2);
  await addOrderItemSauce(order.id, sauces[1].id, 1);
  // //*** Add extras to order ***//
  await addOrderItemExtra(order.id, extras[0].id, 1);
  await addOrderItemExtra(order.id, extras[1].id, 2);

  //*** Add nigiris to order referencing custom box ***//
  // await addOrderItemNigiri(orderPreMade.id, nigiris[0].id, 7);
  // await addOrderItemNigiri(orderCustom.id, nigiris[1].id, 7);
};

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");
