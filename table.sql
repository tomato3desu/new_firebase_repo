create database new_planet_app;

create table if not exists users(
    id int auto_increment primary key,
    uid varchar(255) unique not null,
    nickname varchar(25) default '未設定',
    icon_image_path varchar(255),
    comment text,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    prefecture_id int,
    role varchar(25) default 'user',
    is_active boolean default true,
    CONSTRAINT fk_user_prefecture FOREIGN KEY (prefecture_id)
        REFERENCES prefectures(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uid VARCHAR(255) UNIQUE NOT NULL,
    nickname VARCHAR(25) DEFAULT '未設定' NOT NULL,
    icon_image_path VARCHAR(255),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    prefecture_id INTEGER,
    role VARCHAR(25) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_user_prefecture
        FOREIGN KEY (prefecture_id)
        REFERENCES prefectures(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS prefectures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capital VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL
);

CREATE TABLE prefectures (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capital VARCHAR(50) NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    CONSTRAINT chk_latitude
        CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_longitude
        CHECK (longitude BETWEEN -180 AND 180)
);


create table if not exists pins(
    id int auto_increment primary key,
    created_user_id int not null,
    latitude decimal(10, 7) not null,
    longitude decimal(10, 7) not null,
    title varchar(255) not null,
    description VARCHAR(255),
    pref_id int,
    address varchar(255),
    thumbnail_image_path varchar(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_pins FOREIGN KEY (created_user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pref_pins FOREIGN KEY (pref_id) REFERENCES prefectures(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS pins (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_user_id INTEGER NOT NULL,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    pref_id INTEGER,
    address VARCHAR(255) NOT NULL,
    thumbnail_image_path VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_pins
        FOREIGN KEY (created_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_pref_pins
        FOREIGN KEY (pref_id)
        REFERENCES prefectures(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT chk_pin_latitude
        CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_pin_longitude
        CHECK (longitude BETWEEN -180 AND 180)
);

# INDEXES
CREATE INDEX idx_pins_pref_id
ON pins(pref_id);

CREATE INDEX idx_pins_created_user_id
ON pins(created_user_id);

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_pins_title_trgm
ON pins USING GIN (title gin_trgm_ops);



create table if not exists reviews(
    id int auto_increment primary key,
    created_user_id int not null,
    reviewed_pin_id int not null,
    title varchar(255) not null,
    description text,
    darkness_level int not null,
    access_level int not null,
    season varchar(20) NOT NULL,
    visited_date date not null,
    visited_time time not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_pin FOREIGN KEY (reviewed_pin_id) REFERENCES pins(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (created_user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT check_darkness CHECK (darkness_level between 1 and 5),
    CONSTRAINT check_access_level CHECK (access_level between 1 and 5)
);


CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_user_id INTEGER NOT NULL,
    reviewed_pin_id INTEGER NOT NULL,
    title VARCHAR(50) NOT NULL,
    description TEXT,
    darkness_level INTEGER NOT NULL,
    access_level INTEGER NOT NULL,
    season VARCHAR(10) NOT NULL,
    visited_date DATE NOT NULL,
    visited_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_pin
        FOREIGN KEY (reviewed_pin_id)
        REFERENCES pins(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_review_user
        FOREIGN KEY (created_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_review_darkness
        CHECK (darkness_level BETWEEN 1 AND 5),

    CONSTRAINT chk_review_access
        CHECK (access_level BETWEEN 1 AND 5),
    
    CONSTRAINT chk_review_visited_datetime
        CHECK (
            (visited_date + visited_time) <= CURRENT_TIMESTAMP
        )
);

CREATE INDEX idx_reviews__created_user_id
ON reviews(created_user_id);

CREATE INDEX idx_reviews_reviewed_pin_id
ON reviews(reviewed_pin_id);

CREATE TABLE IF NOT EXISTS review_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    review_id int not null,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE ON UPDATE CASCADE
);

create table if not exists review_images (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id INTEGER NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_img_review
        FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_review_images_review_id
ON review_images(review_id);

create table if not exists pin_bookmarks(
    id int auto_increment primary key,
    bookmarked_user_id int not null,
    bookmarked_pin_id int not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pin_bookmark_pin FOREIGN KEY (bookmarked_pin_id)
        REFERENCES pins(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_pin_bookmark_user FOREIGN KEY (bookmarked_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_bookmark UNIQUE (bookmarked_pin_id, bookmarked_user_id)
);

create table if not exists pin_bookmarks(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bookmarked_user_id INTEGER NOT NULL,
    bookmarked_pin_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pin_bookmark_pin
        FOREIGN KEY (bookmarked_pin_id)
        REFERENCES pins(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_pin_bookmark_user
        FOREIGN KEY (bookmarked_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT unique_bookmark
        UNIQUE (bookmarked_pin_id, bookmarked_user_id)
);

create table if not exists review_good(
    id int auto_increment primary key,
    good_user_id int not null,
    good_review_id int not null,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_good_review FOREIGN KEY (good_review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_review_good_user FOREIGN KEY (good_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT unique_good UNIQUE (good_review_id, good_user_id)
);

create table if not exists review_good(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    good_user_id INTEGER NOT NULL,
    good_review_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_good_review
        FOREIGN KEY (good_review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_review_good_user
        FOREIGN KEY (good_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT unique_good
        UNIQUE (good_review_id, good_user_id)
);

create table if not exists review_report(
    id int auto_increment primary key,
    review_id int not null,
    reporter_id int not null,
    reason varchar(50) not null,
    comment text,
    status varchar(20) not null default 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_id FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        on DELETE CASCADE,
    CONSTRAINT fk_reporter_id FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        on DELETE CASCADE
);

create table if not exists review_report(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL,
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_review_id
        FOREIGN KEY (review_id)
        REFERENCES reviews(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reporter_id
        FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_review_report_review_id_reporter_id
ON review_report (review_id, reporter_id);

CREATE INDEX idx_review_report_status_created_at
ON review_report (status, created_at);

create table if not exists pin_report(
    id int auto_increment primary key,
    pin_id int not null,
    reporter_id int not null,
    reason varchar(50) not null,
    comment text,
    status varchar(20) not null default 'pending',
    created_at DATETIME default CURRENT_TIMESTAMP,
    CONSTRAINT pin_report_fk_pin_id FOREIGN KEY (pin_id)
        REFERENCES pins(id)
        on DELETE CASCADE,
    CONSTRAINT pin_report_fk_reporter_id FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        on DELETE CASCADE
);

create table if not exists pin_report(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pin_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL,
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pin_report_fk_pin_id
        FOREIGN KEY (pin_id)
        REFERENCES pins(id)
        ON DELETE CASCADE,

    CONSTRAINT pin_report_fk_reporter_id
        FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_pin_report_pin_id_reporter_id
ON pin_report (pin_id, reporter_id);

CREATE INDEX idx_pin_report_status_created_at
ON pin_report (status, created_at);


create table if not exists user_report(
    id int auto_increment primary key,
    user_id int not null,
    reporter_id int not null,
    reason varchar(50) not null,
    comment text,
    status varchar(20) not null default 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_report_fk_user_id FOREIGN KEY (user_id)
        REFERENCES users(id)
        on DELETE CASCADE,
    CONSTRAINT user_report_fk_reporter_id FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        on DELETE CASCADE
);

create table if not exists user_report(
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    reporter_id INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL,
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT user_report_fk_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT user_report_fk_reporter_id
        FOREIGN KEY (reporter_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_user_report_user_id_reporter_id
ON user_report (user_id, reporter_id);

CREATE INDEX idx_user_report_status_created_at
ON user_report (status, created_at);



CREATE VIEW pin_review_average AS
SELECT 
    p.id AS pin_id,
    ROUND(AVG(r.darkness_level), 2) AS avg_darkness,
    ROUND(AVG(r.access_level), 2) AS avg_access,
    COUNT(DISTINCT r.id) AS review_count,
    COUNT(DISTINCT pb.id) AS pin_bookmark_count
FROM pins p
LEFT JOIN reviews r ON p.id = r.reviewed_pin_id
LEFT JOIN pin_bookmarks pb ON p.id = pb.bookmarked_pin_id
GROUP BY p.id;

# INDEXES
CREATE UNIQUE INDEX idx_pin_review_average_pin_id
ON pin_review_average(pin_id);

CREATE INDEX idx_pin_review_avg_darkness
ON pin_review_average(avg_darkness);

CREATE INDEX idx_pin_review_avg_access
ON pin_review_average(avg_access);

CREATE INDEX idx_pin_review_count
ON pin_review_average(review_count);

CREATE INDEX idx_pin_review_bookmark_count
ON pin_review_average(pin_bookmark_count);


create or REPLACE VIEW review_good_status as 
SELECT
    r.id as review_id,
    count(DISTINCT rg.id) as good_count
from reviews r
LEFT JOIN review_good rg on r.id = rg.good_review_id
group by r.id;


select p.id, p.created_user_id, p.latitude, p.longitude, p.title, p.description, p.pref_id, p.address, p.thumbnail_image_path,
       pa.avg_darkness, pa.avg_access, pa.review_count, pa.pin_bookmark_count
from pins p 
inner join pin_review_average pa
on p.id = pa.pin_id
order by pa.pin_bookmark_count desc, pa.review_count desc
limit 10;

explain
select * 
from pins 
where title Ilike '%トマト%';

explain
select *
from pins
where created_user_id = 5;

explain
select *
from review_good_status
where review_id in (1, 2, 3, 4, 5);