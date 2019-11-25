var AWS = require("aws-sdk");
AWS.config.update({region: "us-east-1"});
const tableName = "studentCheckIn-dynamoDB";
const tutorTableName = "DoyleAssistantTutorSchedule";
const tutorTableByDay = "DoyleAssistantTutorByDay";

var dbHelper = function () { };
var docClient = new AWS.DynamoDB.DocumentClient();

dbHelper.prototype.addStudent = (studentID, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Item: {
              'studentId' : studentID,
              'userId': userID
            }
        };
        docClient.put(params, (err, data) => {
            if (err) {
                console.log("Unable to insert =>", JSON.stringify(err))
                return reject("Unable to insert");
            }
            console.log("Saved Data, ", JSON.stringify(data));
            resolve(data);
        });
    });
}

dbHelper.prototype.getStudent = (userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            KeyConditionExpression: "#userID = :user_id",
            ExpressionAttributeNames: {
                "#userID": "userId"
            },
            ExpressionAttributeValues: {
                ":user_id": userID
            }
        }
        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err));
                return reject(JSON.stringify(err))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.removeStudent = (studentID, userID) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tableName,
            Key: {
                "userId": userID,
                "studentId": studentID
            },
            ConditionExpression: "attribute_exists(studentId)"
        }
        docClient.delete(params, function (err, data) {
            if (err) {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                return reject(JSON.stringify(err, null, 2))
            }
            console.log(JSON.stringify(err));
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            resolve()
        })
    });
}

dbHelper.prototype.getTutor = (tutorName) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tutorTableName,
            KeyConditionExpression: "#tutorName = :Tutor_name",
            ExpressionAttributeNames: {
                "#tutorName": "Tutor name"
            },
            ExpressionAttributeValues: {
                ":Tutor_name": tutorName
            }
        }
        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err));
                return reject(JSON.stringify(err))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data));
            resolve(data.Items)
            
        })
    });
}

dbHelper.prototype.getTutorByDay = (WeekDay) => {
    return new Promise((resolve, reject) => {
        const params = {
            TableName: tutorTableByDay,
            KeyConditionExpression: "#tutorByDay = :Tutor_By_Day",
            ExpressionAttributeNames: {
                "#tutorByDay": "WeekDay"
            },
            ExpressionAttributeValues: {
                ":Tutor_By_Day": WeekDay
            }
        }
        docClient.query(params, (err, data) => {
            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err));
                return reject(JSON.stringify(err))
            } 
            console.log("GetItem succeeded:", JSON.stringify(data));
            resolve(data.Items)
            
        })
    });
}

module.exports = new dbHelper();