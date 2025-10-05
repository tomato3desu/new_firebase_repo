create database new_firebase;

create table if not exists user_info(
    id int auto_increment primary key,
    uid varchar(255) unique not null,
    nickname varchar(255) default '未設定'
);