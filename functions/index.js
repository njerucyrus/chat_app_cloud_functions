const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.database.ref('Notifications/{user_id}/{notification_id}')
.onWrite(event=>{
  const user_id = event.params.user_id;
  const notification_id = event.params.notification_id;
  console.log("User id is ", user_id);

  if(!event.data.val()){
    return console.log("Notifications has been deleted from the database: ", notification_id);
  }

const fromUser = admin.database().ref(`Notifications/${user_id}/${notification_id}/from`).once('value');

fromUser.then(fromUserResult=>{
   const from_user_id = fromUserResult.val();

   const userQuery = admin.database().ref(`Users/${from_user_id}/displayName`).once('value');
   const deviceToken = admin.database().ref(`Users/${user_id}/deviceTokenId`).once('value');

   return Promise.all([userQuery, deviceToken]).then(result=>{
      const userDisplayName = result[0].val();
      const deviceTokenId = result[1].val();

      const payload = {
        notification:{
          title: "Friend Request",
          body: `You have a new friend request from ${userDisplayName}`,
          icon: "default",
          click_action: "com.me.njerucyrus.chatapp_TAGET_NOTIFICATION"
        },
        data:{
          from_user_id: from_user_id
        }
      };

      return admin.messaging().sendToDevice(deviceTokenId, payload)
      .then(response=>{
          console.log("This was notification feature");
        });

    });
   });
});
