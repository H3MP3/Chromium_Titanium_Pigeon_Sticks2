/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const dbHelper = require('./helpers/dbHelper');
const GENERAL_REPROMPT = "I am sorry, I didnt catch that. What would you like to do?";
const dynamoDBTableName = "studentCheckIn-dynamoDB";
const dynamoDBTutorTableName = "DoyleAssistantTutorSchedule";
const dynamoDBTutorByDay = "DoyleAssistantTutorByDay";

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Hello there. Welcome to Doyle Assistant. What would you like to do? You can say help for all possible options.';
    const repromptText = 'What would you like to do? You can say HELP to get all available options';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const InProgressAddStudentIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'AddStudentIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
}

const AddStudentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AddStudentIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const studentID = slots.StudentID.value;
    return dbHelper.addStudent(studentID, userID)
      .then((data) => {
        const speechText = `You have checked in student I D <say-as interpret-as="digits">${studentID}</say-as>. You can say add student to check-in another student or say HELP for available options`;
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        console.log("Error occured while checking in this student.", err);
        const speechText = "I cannot check in the student right now. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  },
};

const GetStudentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetStudentIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    return dbHelper.getStudent(userID)
      .then((data) => {
        var speechText = "The students that are checked in are,  "
        if (data.length == 0) {
          speechText = "There are no students checked in yet. To check in a student say add student"
        } else {
          studentNumbers = data.map(e => e.studentId).join(", ")
          speechText += '<say-as interpret-as="digits">' + studentNumbers + '</say-as>'
        }
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "I cannot check the student check in list right now. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  }
}

const InProgressRemoveStudentIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'RemoveStudentIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  }
}

const RemoveStudentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RemoveStudentIntent';
  }, 
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const userID = handlerInput.requestEnvelope.context.System.user.userId; 
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const studentID = slots.StudentID.value;
    return dbHelper.removeStudent(studentID, userID)
      .then((data) => {
        const speechText = `You have removed student with student I D <say-as interpret-as="digits">${studentID}</say-as>, you can remove a different student by saying remove student`
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = `There is not a student with that I D for <say-as interpret-as="digits">${studentID}</say-as>, you can add them by saying add`
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
  }
}

const GetTutorIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetTutorIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const tutorName = slots.tutorName.value;
    return dbHelper.getTutor(tutorName)
      .then((data) => {
        var speechText = tutorName + " is availble for tutoring on " 
        if (data.length == 0) {
          speechText = "There are no tutors with that name. Please try another tutor name."
        } else {
          speechText += data.map(e => e.Day).join(" ") 
        } 
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "I cannot find the tutor list right now. Please try again!"
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  }
}

const GetTutorByDayHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetTutorByDayIntent';
  },
  async handle(handlerInput) {
    const {responseBuilder } = handlerInput;
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const WeekDay = slots.WeekDay.value;
    return dbHelper.getTutorByDay(WeekDay)
      .then((data) => {
        var speechText = "On " 
        if (data.length == 0) {
          speechText = "There are no tutors currently available on " + WeekDay
        } else {
          speechText += WeekDay + " ," + data.map(e => e.Tutors)
        }
        return responseBuilder
          .speak(speechText)
          .reprompt(GENERAL_REPROMPT)
          .getResponse();
      })
      .catch((err) => {
        const speechText = "Please try again and use a valid week day."
        return responseBuilder
          .speak(speechText)
          .getResponse();
      })
  }
}


const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'No problem, here are the options you can say. You can say, "add student", to add a student to tutoring. Or to remove a student from check-in, you can say, "remove student". Or you can say, "list students", to hear all students that are currently checked in.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say it again.')
      .reprompt('Sorry, I can\'t understand the command. Please say it again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    InProgressAddStudentIntentHandler,
    AddStudentIntentHandler,
    GetStudentIntentHandler,
    InProgressRemoveStudentIntentHandler,
    RemoveStudentIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    GetTutorIntentHandler,
    GetTutorByDayHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withTableName(dynamoDBTableName)
  .withTableName(dynamoDBTutorTableName)
  .withTableName(dynamoDBTutorByDay)
  .withAutoCreateTable(true)
  .lambda();
