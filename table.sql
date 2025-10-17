create database new_firebase;

create table if not exists user_info(
    id int auto_increment primary key,
    uid varchar(255) unique not null,
    nickname varchar(255) default '未設定',
    icon_image_path varchar(255),
    comment varchar(255)
);

create table if not exists pin_info(
    id int auto_increment primary key,
    created_user_id int not null,
    latitude decimal(10, 7) not null,
    longitude decimal(10, 7) not null,
    title varchar(255) not null,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (created_user_id) REFERENCES user_info(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS pin_image_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pin_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pin FOREIGN KEY (pin_id) REFERENCES pin_info(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);