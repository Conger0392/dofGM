# DOF_GM
DOF_GM网页管理系统后台


## 安装环境

需要nodejs环境，下载[nodejs](https://nodejs.org/en/)

## 使用
安装好nodejs后，进入项目目录`./DOF_GM`


安装依赖模块

```bash
npm install 
```

等待安装完后

```bash
npm start  // 启动服务 
```


打开浏览器，输入地址[http://localhost:5000](http://localhost:5000)



在获取用户列表的时候（manage/user/list） 查询的不能获取到指定名字 把conger改成admin之类的 



## 数据库设置

在目录`config/index.js` 可以修改端口
在目录`db/config.js` 可以修改数据库连接配置

创建数据库dnf_service

在数据库下创建两个表
创建表pvf_item

```bash
CREATE TABLE `test`.`pvf_item`(  
  `Id` INT(11) NOT NULL AUTO_INCREMENT,
  `ItemName` VARCHAR(200),
  `SqliteName` VARCHAR(200),
  `ItemCode` INT(11) NOT NULL,
  `ShopID` INT(11) NOT NULL,
  `FilePath` VARCHAR(200),
  `ItemType` INT(11) NOT NULL,
  `ItemType2` INT(11) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=INNODB CHARSET=utf8 COLLATE=utf8_general_ci;
```
创建表role
```bash
CREATE TABLE `test`.`role`(  
  `rid` INT(11) NOT NULL AUTO_INCREMENT,
  `menus` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `create_time` DATETIME,
  `auth_time` DATETIME,
  `auth_name` VARCHAR(255),
  PRIMARY KEY (`rid`)
);

```

在d_taiwan.accounts添加字段 role_id reg_date 非空

## 部署

我使用的宝塔 下载PM2，如果没有宝塔可以手动安装


安装nodejs运行环境
```bash
yum -y install nodejs
```

安装pm2
```bash
npm install -g pm2
```
上传文件到服务器目录下，进入这个目录启动
```bash
pm2 start DOFGM.js
```
其他操作
```bash
pm2 list
pm2 stop DOFGM 停止 
pm2 delete DOFGM 删除 
```
