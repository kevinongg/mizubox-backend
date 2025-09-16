DROP TABLE IF EXISTS combo_temakis;
DROP TABLE IF EXISTS temaki_extras;
DROP TABLE IF EXISTS temaki_sauces;
DROP TABLE IF EXISTS temaki_ingredients;
DROP TABLE IF EXISTS order_boxes;
DROP TABLE IF EXISTS combos;
DROP TABLE IF EXISTS extras;
DROP TABLE IF EXISTS sauces;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS temakis;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS boxes;
DROP TABLE IF EXISTS users;

/* ========= USERS ========= */
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
email TEXT UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role TEXT DEFAULT 'user' -- (eg.. user || admin)
);

/* ========= USERS CREATE BOXES ========= */
-- user creates a cart-like container of temakis in a box
CREATE TABLE boxes (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
status TEXT DEFAULT 'draft', -- (eg.. draft || ordered || delivered || cancelled)
total_price DECIMAL(6,2) NOT NULL
);

/* ========= USERS PLACE ORDERS ========= */
-- finalized purchase of one or more boxes
CREATE TABLE orders (
id SERIAL PRIMARY KEY,
user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
created_at DATE NOT NULL,
status TEXT DEFAULT 'pending', -- (eg.. 'pending', 'confirmed', 'delivered')
total_price DECIMAL(6,2) NOT NULL
);

/* ========= JUNCTION TABLE (BOXES & ORDERS [one-to-many]) ========= */
-- which box belongs to a given order (one order can contain many boxes)
CREATE TABLE order_boxes (
id SERIAL PRIMARY KEY,
order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
box_id INTEGER NOT NULL REFERENCES boxes(id)
);

/* ========= TEMAKIS ========= */
-- creates temakis inside boxes
CREATE TABLE temakis (
id SERIAL PRIMARY KEY,
box_id INTEGER NOT NULL REFERENCES boxes(id) ON DELETE CASCADE,
image_url TEXT NOT NULL
);

/* ========= INGREDIENTS ========= */
-- ingredients to add to a temaki
CREATE TABLE ingredients (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
type TEXT NOT NULL, -- (eg.. protein || veggie || sauce)
description TEXT NOT NULL,
quantity INTEGER NOT NULL,
image_url TEXT NOT NULL,
price DECIMAL(6,2) DEFAULT 0.00,
available BOOLEAN DEFAULT TRUE
);

/* ========= JUNCTION TABLE (TEMAKIS & INGREDIENTS [many-to-many] ========= */
CREATE TABLE temaki_ingredients (
id SERIAL PRIMARY KEY,
temaki_id INTEGER NOT NULL REFERENCES temakis(id) ON DELETE CASCADE,
ingredient_id INTEGER NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE
);

/* ========= SAUCES ========= */
-- sauces to add to a temaki
CREATE TABLE sauces (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL,
quantity INTEGER NOT NULL,
image_url TEXT NOT NULL,
price DECIMAL(4,2) DEFAULT 0.00
);

/* ========= JUNCTION TABLE (TEMAKIS & SAUCES [many-to-many]) ========= */
CREATE TABLE temaki_sauces (
id SERIAL PRIMARY KEY,
temaki_id INTEGER REFERENCES temakis(id) ON DELETE CASCADE,
sauce_id INTEGER REFERENCES sauces(id)
);

/* ========= EXTRAS ========= */
-- extras to add to a temaki
CREATE TABLE extras (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL,
quantity INTEGER NOT NULL,
image_url TEXT NOT NULL,
price DECIMAL(4,2) DEFAULT 0.00
);

/* ========= JUNCTION TABLE (TEMAKIS & EXTRAS [many-to-many]) ========= */
CREATE TABLE temaki_extras (
id SERIAL PRIMARY KEY,
temaki_id INTEGER REFERENCES temakis(id) ON DELETE CASCADE,
extra_id INTEGER REFERENCES extras(id)
);

/* ========= COMBOS ========= */
-- pre-made sets of temakis
CREATE TABLE combos (
id SERIAL PRIMARY KEY,
name TEXT NOT NULL,
description TEXT NOT NULL,
image_url TEXT NOT NULL,
price DECIMAL(4,2) DEFAULT 0.00
);

/* ========= JUNCTION TABLE ( COMBOS & TEMAKIS [many-to-many]) ========= */
CREATE TABLE combo_temakis (
id SERIAL PRIMARY KEY,
combo_id INTEGER REFERENCES combos(id) ON DELETE CASCADE,
temaki_id INTEGER REFERENCES temakis(id)
);