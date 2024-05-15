const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountsKeys.json");

/*---------INITIALIZING-------*/
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }); 
const db = admin.firestore()
/*---------INITIALIZING-------*/


async function createUserDocument(userId, userName, currentTime) {
    try {
        const db = admin.firestore();
        const usersRef = db.collection('users');

        await usersRef.doc(String(userId)).set({
            userName: userName || "none",
            userPaymentName: "",
            userPhone: "",
            paymentPrice: 0,
            userLanguage: "ru",
            userEmail: "",
            productId: 0,
            userPayment: false,
            userPaymentMethod: "",
            userFirstTestPassed: false,
            userSecondTestPassed: false,
            userFirstTestAttempts: 0,
            userSecondTestAttempts: 0,
            userAnswName: "",
            userAnswInst: "",
            userAnswWhoAreYou: "",
            userAnswAim: "",
            userAnswAimRealize: "",
            userAnswWeaknesses: "",
            userAnswClient: "",
            userWaitingForSession: false,
            userWaitingForSessionTime: "",
            userBotStartTime: String(currentTime) || "none",
            userBotFinishTime: "",
            userFirstTestSkipped: false,
            userSecondTestSkipped: false
        });

        console.log(`User document created for userId: ${userId}`);
    } catch (error) {
        console.error('Error creating user document:', error);
    }
}


async function updateUserParameter(userId, parameterName, parameterValue) {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(String(userId));

        const updateObject = {
            [parameterName]: parameterValue || "none",
        };
        await userRef.update(updateObject);

        console.log(`User parameter updated for userId: ${userId}`);
    } catch (error) {
        console.error('Error updating user parameter:', error);
    }
}

async function getAdminUsersInfo() {
    const db = admin.firestore();
    const usersCollection = db.collection('users');
  
    try {
        const usersSnapshot = await usersCollection.get();
  
        if (usersSnapshot.empty) {
            console.log('No users found.');
            return {};
        }
  
        let usersAmount = 0;
        let paymentsAmount = 0;
        let waitingForSessionAmount = 0;
  
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            usersAmount++;
            if (userData.userPayment === true) paymentsAmount++;
            if (userData.waitingForSession === true) waitingForSessionAmount++;
        });
  
        return {
            usersAmount,
            paymentsAmount,
            waitingForSessionAmount
        };
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
}


async function updateUserAfterPaymentInfo(userId, 
    userEmail, 
    userPhone,
    userName,
    paymentPrice,
    productId,
    paymentMethod
    ) {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(String(userId));

        await userRef.update({
            userEmail: userEmail || "none",
            userPhone: userPhone || "none",
            userPaymentName: userName || "none",
            paymentPrice: paymentPrice || "none",
            productId: productId || "none",
            userPayment: true,
            userPaymentMethod: paymentMethod
        });

        console.log(`User parameter updated for userId: ${userId}`);
    } catch (error) {
        console.error('Error updating user parameter:', error);
    }
}


async function updateUserTests(userId, parameterName, parameterValue, parameterName2, parameterValue2, parameterName3, parameterValue3) {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(String(userId));

        const updateObject = {
            [parameterName]: parameterValue || "none",
            [parameterName2]: parameterValue2 || "none",
            [parameterName3]: parameterValue3 || "none"
        };
        await userRef.update(updateObject);

        console.log(`User parameter updated for userId: ${userId}`);
    } catch (error) {
        console.error('Error updating user parameter:', error);
    }
}


async function updateUserPersonalAnswersInfo(userId, 
    userAnswName, 
    userAnswInst,
    userAnswWhoAreYou,
    userAnswAim,
    userAnswAimRealize,
    userAnswWeaknesses,
    userAnswClient,
    currentTime
    ) {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(String(userId));

        await userRef.update({
            userAnswName: userAnswName || "none",
            userAnswInst: userAnswInst || "none",
            userAnswWhoAreYou: userAnswWhoAreYou || "none",
            userAnswAim: userAnswAim || "none",
            userAnswAimRealize: userAnswAimRealize || "none",
            userAnswWeaknesses: userAnswWeaknesses || "none",
            userAnswClient: userAnswClient || "none",
            userWaitingForSession: true,
            userWaitingForSessionTime: String(currentTime) || "none",
            userBotFinishTime: String(currentTime) || "none"
        });

        console.log(`User parameter updated for userId: ${userId}`);
    } catch (error) {
        console.error('Error updating user parameter:', error);
    }
}


module.exports = {
    createUserDocument,
    updateUserParameter,
    updateUserAfterPaymentInfo,
    updateUserTests,
    updateUserPersonalAnswersInfo,
    getAdminUsersInfo
}