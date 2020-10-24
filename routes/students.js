const router = require("express").Router();
var AWS = require("aws-sdk");
const uid = require('uuid');

require('dotenv').config();
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const { access } = require("fs");
// const { Console } = require("console");

AWS.config.update({
  region: 'ap-southeast-1',
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
});

const tableName = 'dngStudents';
const bucketName = 'baitapgiuaky';
const bucketUrl = 'https://baitapgiuaky.s3-ap-southeast-1.amazonaws.com/';
const s3 = new AWS.S3();

let docClient = new AWS.DynamoDB.DocumentClient();

//Upload images
// router.post('/images', async(req,res)=>{
//   multer({
//     storage: multerS3({
//       s3: s3,
//       bucket: 'dngimages',
//       acl: 'public-read',
//       metadata: function (req, file, cb) {
//         cb(null, {fieldName: file.fieldname});
//       },
//       key: function (req, file, cb) {
//         cb(null, file.originalname)
//       },
//       rename: function (fieldname, filename) {
//         return filename.replace(/\W+/g, '-').toLowerCase();
//       }
//     })
//   })
// })
  
//Get all
router.get("/getall", async (req, res) => {
  var params = {
    TableName: tableName,
  };
  docClient.scan(params, function (err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send(
        data
      );
    }
  });
});

//Get with id
router.get("/getonce/:id", async (req, res) => {
  var params = {
    TableName: tableName,
    Key: {
      id: req.params.id
    },
  };
  docClient.get(params, function (err, data) {
    if (err) {
      res.send("users::fetchOneByKey::error - " + JSON.stringify(err, null, 2));
    } else {
      res.send(
        "users::fetchOneByKey::success - " + JSON.stringify(data, null, 2)
      );
    }
  });
});

//Create Students
router.post("/create", async (req, res) => {
  //console.log(req.body);
  var oid = uid.v4()
  // s3.putObject({
  //   Body: "", 
  //   Bucket: bucketName, 
  //   ContentType: 'image/jpeg',
  //   Key: `${oid}.jpg`
  // }, (err, data)=> {
  //   if(err)
  //     console.log('Error' + JSON.stringify(err, null, 2));
  //   else
  //     console.log(data)
  // });
  var dngStudent = {
    'stname':req.body.stname,
    'avatar':`${bucketUrl}${oid}.jpg`,
    'id':oid,
    'mssv':req.body.mssv,
    'birth':req.body.birth
  };

  var params = {
      TableName: tableName,
      Item:  dngStudent
  };

  docClient.put(params, function (err, data) {

      if (err) {
          res.send("users::save::error - " + JSON.stringify(err, null, 2));                      
      } else {
          res.send("users::save::success" );    
          //res.redirect('http://localhost:3000');                  
      }
  });
  // res.send("users::save::success" ); 
});

//Update Student
router.post("/update", async (req, res) => {

  var params = {
    TableName: tableName,
    Key: { "id": req.body.id },
    UpdateExpression: "set stname=:n,avatar=:a,mssv=:ms,birth=:b",
    ExpressionAttributeValues: {
      ':n':req.body.stname,
      ':a':req.body.avatar,
      ':ms':req.body.mssv,
      ':b':req.body.birth
    },
    ReturnValues: "UPDATED_NEW"
  };

  docClient.update(params, function (err, data) {
      if (err) {
          res.send("users::save::error - " + JSON.stringify(err, null, 2));                      
      } else {
          res.send("users::save::success" );                      
      }
  });
});

//Delete Student
router.get("/delete/:id", async (req, res) => {
  var params = {
    TableName: tableName,
    Key: {
        "id": req.params.id
    }
  };

  docClient.delete(params, function (err, data) {

      if (err) {
        res.send("users::delete::error - " + JSON.stringify(err, null, 2));
      } else {
          res.send("users::delete::success");
      }
  });
});

module.exports = router;
