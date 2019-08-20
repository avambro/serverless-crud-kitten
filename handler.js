'use strict';
const AWS = require('aws-sdk')
/*
module.exports.hello = async event => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
  */

 module.exports = {
   create: async(event,context) => {
      let bodyObj = {}
      try{
        bodyObj = JSON.parse(event.body)
      }catch(jsonError){
        console.log('There was an error parsing the body',jsonError)
        return {
          statusCode: 400
        }
      }

      if(typeof bodyObj.name === 'undefined'){
         console.log('Missing parameters')
         return {
           statusCode:400
         }
      }

      let putParams = {
        TableName: process.env.DYNAMODB_KITTEN_TABLE,
        Item: {
          name: bodyObj.name,
          age: bodyObj.age
        }
      }

      let putResults = {}
      try {
        let dynamodb = new AWS.DynamoDB.DocumentClient()
        putResults = await dynamodb.put(putParams).promise()
      } catch (putError) {
        console.log('There was a problem putting the kitten')
        console.log('putParams',putParams)
        return {
          statusCode:500
        }
      }

      return {
        statusCode:201
      }



   },
   list: async(event,context) => {
      let scanParams = {
        TableName: process.env.DYNAMODB_KITTEN_TABLE
      }
      let scanResult = {}
      try {
        let dynamodb =  new AWS.DynamoDB.DocumentClient()
        scanResult = await dynamodb.scan(scanParams).promise()


      } catch (scanError) {
        console.log("There was a problem scanning the kitten");
        console.log("scanError", scanError);
         return {
           statusCode: 500
         };
      }

      if(scanResult.Item === null ||
        !Array.isArray(scanResult.Item) ||
        scanResult.Item.length === 0){
          return {
            statusCode: 404
          };
        }


        return {
          statusCode: 200,
          body:  JSON.stringify(scanResult.Item.map(kitten => {
            return {
              name: kitten.name,
              age: kitten.age
            };
          }))
        };

   },
   get: async(event,context) => {

    let getParams = {
      TableName = process.env.DYNAMODB_KITTEN_TABLE,
      key: {
        name: event.pathParameters.name
      }
    }

    let getResult = {}
    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      getResult = dynamodb.get(getParams).promise()

    } catch (errorResult) {
      console.log("There was a problem getting the kitten");
      console.log("getResult", errorResult);
      return {
            statusCode: 500
          };
    }

    if(getResult.Item === null){
      return {
        statusCode: 404
      };
    }


    return {
      statusCode: 200,
      body: JSON.stringify({
        name:getResult.Item.name,
        age: getResult.Item.age
      })
    };





   },
   update: async(event,context) => {

    let bodyObj = {}
    try{
      bodyObj = JSON.parse(event.body)
    }catch(jsonError){
      console.log('There was an error parsing the body',jsonError)
      return {
        statusCode: 400
      }
    }

    if(typeof bodyObj.name === 'undefined'){
        console.log('Missing parameters')
        return {
          statusCode:400
        }
    }

    let updateParams = {
      TableName = process.env.DYNAMODB_KITTEN_TABLE,
      Key: {
        name: event.pathParameters.name
      },
      UpdateExpression: 'set #age = :age',
      ExpressionAttributeName: {
        '#age':'age'
      },
      ExpressionAttributeValues:{
        ':age': bodyObj.age
      }
    }

    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
      dynamodb.update(updateParams).promise()

    } catch (updateError) {
      console.log("There was a problem Updating the kitten");
      console.log("updateResults", updateError);
      return {
            statusCode: 500
          };
    }

    return {
      statusCode: 200,
    };




   },
   delete: async(event,context) => {

      let deleteParams = {
      TableName = process.env.DYNAMODB_KITTEN_TABLE,
      key: {
        name: event.pathParameters.name
      }
    }


    try {
      let dynamodb = new AWS.DynamoDB.DocumentClient()
       dynamodb.delete(deleteParams).promise()

    } catch (deleteError) {
      console.log("There was a problem deleting the kitten");
      console.log("deleteResults", deleteError);
      return {
            statusCode: 500
          };
    }



    return {
      statusCode: 200,
    };



   },
 }



  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };

