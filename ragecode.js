
jQuery(document).on('turbolinks:load', function() {



// ------------show version-----------------

// -+-+-+//-+-+-+//-+-+//  KickOff function that starts actual game that user sees


function toggleFullscreen(elem) { // Flips back and forth from normal to fullscreen on compatable devices
    // if(usingTouchScreen){return;}
  elem = elem || document.documentElement;
  if (!document.fullscreenElement && !document.mozFullScreenElement &&
    !document.webkitFullscreenElement && !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}




function LoyalKickOff() {

  
gon.watch("thisuser", grabUser); // Snags the user object from Ruby, and passes it to the grabUser Callback
  function grabUser (obj) { // Set the recieved object to a Javascript variable we can pass to the canvas
    userholder = obj;
    if(userholder === null){
      useremail = "";
    }
    else {
      useremail = userholder.email;
    }
  }

  gon.watch("mycharacters", getCharacters); // Snags the user object from Ruby, and passes it to the getCharacters Callback
  function getCharacters (obj) { // Set the recieved object to a Javascript variable we can pass to the canvas
      charactersholder = obj;
  }



//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
//---------------INCOMING NETWORK SECTION
//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------


// let charactersholder;
// let userholder;






  let lastupdated = 0;
  let enemywilladd = true;
  setupGlobalChat();


function setupGroveChat() {
  App.grove_chat = App.cable.subscriptions.create({
    channel: "GroveChannel"
  }, {
    received(data) {    
      templist = (data['message']);
      handleNetworkPackets();
    },
    send_message(message) {
      return this.perform('send_message', { message });
    },
  });
}

function setupRuinChat() {
  App.ruin_chat = App.cable.subscriptions.create({
    channel: "RuinChannel"
  }, {
    received(data) {    
      templist = (data['message']);
      handleNetworkPackets();
    },
    send_message(message) {
      return this.perform('send_message', { message });
    },
  });
}

function setupGlobalChat() {
  App.global_chat = App.cable.subscriptions.create({
    channel: "GlobalChannel"
  }, {      
    received(data) {    
      templist = (data['message']);
      handleNetworkPackets();
    },
    send_message(message) {
      return this.perform('send_message', { message });
    },
  }); 
}

function handleNetworkPackets() {
  localPlayerName = false;
    willadd = true;
    if(templist[0] === localplayer.myName) { // Check if it's your own message
      // Do nothing if the signal is your own
    } else {
    if(templist.length === 5) { // 5 length so it's a player movement update
      handleNetworkPlayerPing();
      playerpingsgot+= 1;
    } // End of If templist is length of 5 
    if (templist.length === 3) { // if it's a 3 length then it's a world update ping
      handleWorldUpdatePing();
    } // End of If templist.length===3
    if (templist.length === 2) { // if it's a 2 it's an enemy update ping
      handleEnemyUpdate();
    } // End of if templist 2 then enemy ping
    if (templist.length === 1) { // if it's a 1 it's a remove player ping
      playerArray.splice([templist[0]], 1); // remove player
    } // End of if Templist is 1 remove ping
  } // End of If own message check
}

function handleNetworkPlayerPing() {
  for(let n = 0; n < playerArray.length; n++) { // For the length of the array
    if(templist[0] === playerArray[n].myName) { // Check if name already exists in the roster
      willadd = false; // Do not add player to array, just move player
    }
  }
  if(willadd === true) { // If we are adding the player to the array
    addNetworkPlayer();
  } else { // If we are not adding the player to the array
    updateNetworkPlayer();
  } // End of else from if will add is true
}

function updateNetworkPlayer() {
  for(let n = 0; n < playerArray.length; n++) { // For the length of the player array
    if (playerArray[n].myName === templist[0]) { // if any in it match the name of the packet
      if ((playerArray[n].x > templist[2] + 10 || playerArray[n] < templist[2] - 10) || 
        (playerArray[n].y > templist[3] + 10 || playerArray[n] < templist[3] - 10) ) {
        // Snap the player into place
        playerArray[n].x = templist[2]; // ----- Update the actual position of the player
        playerArray[n].y = templist[3];
        // console.log(templist[1]);
        playerArray[n].currenthitpoints = templist[1]; // update player hp
      } else {
        // Use standard move to/ go to
        playerArray[n].gotoX = templist[2]; // ----- Update the goto X and Y of the player
        playerArray[n].gotoY = templist[3];
        // console.log(templist[1]);
        playerArray[n].currenthitpoints = templist[1]; // update player hp
      }
    } // End of if player array contains name
  } // End of For loop on Player Array
}

function addNetworkPlayer() {
  let remoteplayer = Character('remoteplayer');  // create new instance of class for player
  if(templist[4] === 'prince') {
    remoteplayer.remoteInit(princePic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'knight') {
    remoteplayer.remoteInit(knightPic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'femaleknight') {
    remoteplayer.remoteInit(femaleknightPic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'mage') {
    remoteplayer.remoteInit(magePic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'elffemale') {
    remoteplayer.remoteInit(elffemalePic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'elfmale') {
    remoteplayer.remoteInit(elfmalePic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'darkelfmale') {
    remoteplayer.remoteInit(darkelfmalePic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'darkelffemale') {
    remoteplayer.remoteInit(darkelffemalePic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'normalgirl') {
    remoteplayer.remoteInit(normalgirlPic, templist[0], templist[2],templist[3]); // init the new player and place in world
  } else if(templist[4] === 'bard') {
    remoteplayer.remoteInit(bardPic, templist[0], templist[2],templist[3]); // init the new player and place in world
  }
  playerArray.push(remoteplayer); // push the new player into the array
  worldplayers = "" + (playerArray.length + 1) + " Players Active"; // Track Number of Players added
}

function handleWorldUpdatePing() {
  if(templist[1] > worldAgeCounter) { // If another client has a higher world time 
    let worldagerange = Math.floor(Math.random() * 1000) + 1; // the world age of lesser gets reduced further
    worldAgeCounter = templist[1] - (1000 + worldagerange);// World updates from network, worldclock updates with (random)margin below
    leadClient = false; // Our client has recently been updated from another
    worldupdatesaccepted+= 1;
    lastupdatedtimer+= 1;
    worldupdatesdropped = 0; // Reset number of world updates dropped
  } else { // the other client's world time was less or we're already listed as lead client
    worldupdatesdropped+= 1;
  }
  if (lastupdatedtimer > 10 && worldupdatesdropped > 3) { // if it's been over a margin since the last update
    lastupdatedtimer = 0; // reset the lastupdated counter
    leadClient = true; // we are now lead client
  } 
  lastupdatedtimer+= 1;
  worldpingsgot+= 1;
}

function handleEnemyUpdate() {
  enemywilladd = true; // Perform separate check to see if enemy needs spawned rather than updated
  incomingenemyarray = templist[1];
  findUpdateRemoveIncomingEnemies();
  if (incomingenemyarray.length > 0) { // if there are any unaccounted for entities in the array
    addRemainingIncomingEnemies();
  } // End of if there are unac enem in array
  enemyupdatepingsgot+= 1;
}

function addRemainingIncomingEnemies() {
  for (let incomingenemies = 0; incomingenemies < incomingenemyarray.length; incomingenemies++) {
    if (incomingenemyarray[incomingenemies][3] > 0) { // If the enemy is alive  
      if (enemyArray.length < 40) { // -- Add enemy to the array if not found 
        if (incomingenemyarray[incomingenemies][4] === "bat") {
          let remoteenemy = EnemyBat('remoteenemy',0,0);  // create new instance of composited object bat
          remoteenemy.init(incomingenemyarray[incomingenemies][0], incomingenemyarray[incomingenemies][1], incomingenemyarray[incomingenemies][2], incomingenemyarray[incomingenemies][3]); // init the new enemy with ID and place in world
          enemyArray.push(remoteenemy); // push the new enemy into the array
        } else if (incomingenemyarray[incomingenemies][4] === "skeleton") {
          let remoteenemy = EnemySkeleton('remoteenemy',0,0);  // create new instance of composited object skeleton
          remoteenemy.init(incomingenemyarray[incomingenemies][0], incomingenemyarray[incomingenemies][1], incomingenemyarray[incomingenemies][2], incomingenemyarray[incomingenemies][3]); // init the new enemy with ID and place in world
          enemyArray.push(remoteenemy); // push the new enemy into the array
        }  else if (incomingenemyarray[incomingenemies][4] === "banshee") {
          let remoteenemy = EnemyBanshee('remoteenemy',0,0);  // create new instance of composited object skeleton
          remoteenemy.init(incomingenemyarray[incomingenemies][0], incomingenemyarray[incomingenemies][1], incomingenemyarray[incomingenemies][2], incomingenemyarray[incomingenemies][3]); // init the new enemy with ID and place in world
          enemyArray.push(remoteenemy); // push the new enemy into the array
        } // End of if enemy type Banshee            
      } // End of if enemyArray length
    } // End of if the enemy is alive  
  } // End of for incoming enemies
} // End of function

function findUpdateRemoveIncomingEnemies() { //--- For loop to find existing enemies, update them, and remove listing from incoming roster
  for (let localenemies = 0; localenemies < enemyArray.length; localenemies++) { // for local enemies
    for (let incomingenemies = 0; incomingenemies < incomingenemyarray.length; incomingenemies++) { // for/incoming entities
      if (incomingenemyarray[incomingenemies][0] === enemyArray[localenemies].myID) { // if names match update and remove
        enemywilladd = false; // don't add this enemy to array -- just update
        enemyArray[localenemies].gotoX = incomingenemyarray[incomingenemies][1]; // Fire the  update code here
        enemyArray[localenemies].gotoY = incomingenemyarray[incomingenemies][2];
        enemyArray[localenemies].currenthitpoints = incomingenemyarray[incomingenemies][3];
        enemyArray[localenemies].updatesreceived+= 1;
        incomingenemyarray.splice(incomingenemies,1);
      } // End of if Names match
    } // End of for incoming array loop
  } // End of for local enemies loop
} // End of function


//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Map Switching Section
function switchRuin(side) { // Load local map and net-socket for Ruin
  worldAgeCounter = 1;
  removeAllSubscriptions();
  enemyArray = [];
  playerArray = [];
  localplayer.world = "ruin";
  saveCharacter(); 
  loadRuin();
  setupRuinChat();
  groveChatActive = false;
  globalChatActive = false;
  ruinChatActive = true;
  if(side === "top") {
    localplayer.reset(560,50);
  } else if(side === "bottom") {
    localplayer.reset(1360,1950);
  }
  drawMapDisplay();
  quickTipActive = true;
  quickTipString = "Entering The Ruin";
  quickTipTime = 1;
}

function switchGrove(side) {  // Load local map and net-socket for Grove
  worldAgeCounter = 1;
  removeAllSubscriptions();
  enemyArray = [];
  playerArray = [];
  localplayer.world = "grove";
  saveCharacter();
  loadGrove();
  setupGroveChat();
  groveChatActive = true;
  globalChatActive = false;
  ruinChatActive = false;
  if(side === "bottom") {
    localplayer.reset(460,1950);
  } else if (side === "top") {
    localplayer.reset(1260,50);
  }
  drawMapDisplay();
  quickTipActive = true;
  quickTipString = "Entering The Grove";
  quickTipTime = 1;
}

function switchGlobal() {  // Load local map and net-socket for Global starting map
  worldAgeCounter = 1;
  removeAllSubscriptions();
  enemyArray = [];
  playerArray = [];
  localplayer.world = "global";
  saveCharacter();
  loadGlobal();
  setupGlobalChat();
  console.log("switchGlobal Ran");
  groveChatActive = false;
  globalChatActive = true;
  ruinChatActive = false;
  if(localplayer.current_xp > 5) {
    localplayer.reset(800,100);
  } else {
    localplayer.reset(150,150);
  }
  drawMapDisplay();
  if (localplayer.current_xp > 20) {
    quickTipActive = true;
    quickTipString = "Entering The Fount";
    quickTipTime = 1;
  }
}

function removeAllSubscriptions() {
  if(globalChatActive) {
    App.cable.subscriptions.remove(App.global_chat);
  }
  if(groveChatActive) {
    App.cable.subscriptions.remove(App.grove_chat);
  }
  if(ruinChatActive) {
    App.cable.subscriptions.remove(App.ruin_chat);
  }
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Outgoing Network Section
function sendPingSwitchboard() { // Decide which channel we're sending network updates to
  if(globalChatActive) {
    return App.global_chat.send_message(payload);
  } else if(groveChatActive) {
    return App.grove_chat.send_message(payload);
  } else if(ruinChatActive) {
    return App.ruin_chat.send_message(payload);
  }
}

function sendWorldPing() { // Updates other clients of current world state and age; also updates other clients if this world is oldest
    payload = [];
    payload = [chosenCharacter.name, worldAgeCounter, [] ];
    worldpingssent+= 1;
    sendPingSwitchboard();
}

function sendPing() { // Sends local player state to other clients periodically
    payload = [];
    payload = [localplayer.myName,localplayer.currenthitpoints,localplayer.x,localplayer.y,chosenCharacter.sprite];
    playerpingssent+= 1;
    sendPingSwitchboard();
}

function sendPlayerMovement() { // Despite name, really just sends updates of player position when they move and tracks leave pings 
  if(localplayer.x > lastLocalPlayerPositionX + 5 || localplayer.x < lastLocalPlayerPositionX - 5 || localplayer.y > lastLocalPlayerPositionY + 5 || localplayer.y < lastLocalPlayerPositionY - 5) {
    lastLocalPlayerPositionX = localplayer.x;
    lastLocalPlayerPositionY = localplayer.y;   
    sendPing();     
  }
}

function sendSingleLeavePing() {
  payload = [localplayer.myName];
  sendPingSwitchboard();
}

function checkIfLeftPage() { // Checks if our address bar has changed in the browser, and if so, sends leave pings
  if((location != location) && leavePingiterator === 0) {
    sendSingleLeavePing();
    removeAllSubscriptions();
    leavePingiterator+= 1;
    saveCharacter();
    playLoyal = null;
  }
}

function sendAllEnemyUpdate() { // send network packet about enemy state
  payload = []; // actual packet contents
  enemypayload = []; // array of enemies and info passed
  for (let localenemies = 0; localenemies < enemyArray.length; localenemies++) { // for all local enemies
    let enemytobeadded = []; // Array to hold individual enemy info as it's assembled and added to array of enemies
    enemytobeadded.push(enemyArray[localenemies].myID);// ID of individual enemy pushed to enemy payload
    enemytobeadded.push(enemyArray[localenemies].x);
    enemytobeadded.push(enemyArray[localenemies].y);
    enemytobeadded.push(enemyArray[localenemies].currenthitpoints);
    enemytobeadded.push(enemyArray[localenemies].enemytype);
    enemyArray[localenemies].updatessent+= 1;
    enemypayload.push(enemytobeadded); // push the assembled data enemy data to the payload array
  }
  payload = [localplayer.myName, enemypayload];// array contains array of enemies containing arrays of stats
  enemyupdatepingssent+= 1; // increment how many enemy update pings sent
  sendPingSwitchboard(); // return the actual message and send
}

function sendSingleEnemyUpdate(enemy) { // send network packet about enemy state
    payload = []; // actual packet contents
    enemypayload = [enemy]; // array of enemies and info passed
    payload = [localplayer.myName, enemypayload];// array contains array of enemies containing arrays of stats
    enemyupdatepingssent+= 1; // increment how many enemy update pings sent
    sendPingSwitchboard(); // return the actual message and send
}

function handleWorldAgeAndPings() { // Track the age of the world and it"s ping timers 
  if(pingcounter === 50) {
    sendPing();
    if (leadClient) {
      sendAllEnemyUpdate();
      sendWorldPing();
    }
  }
  if(worldAgeCounter > 100000000) {
    worldAgeCounter = 0;
  } else {
    worldAgeCounter+= 1;
  }
  gameAgeCounter+=1;
  animationiterator+= 1;
  if (animationiterator > 800) {
    animationiterator = 0;
  }
  pingcounter+=1;
  if(pingcounter === 100) {
    pingcounter = 0;
  }
}

function loadRuin() {
  roomGrid =
       [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,1,1,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,1,1,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,1,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,1,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,1,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,1,1,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,0,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,0,0,12,12,12,12,12,12,12,12,12,12,12,12,12,1,1,1,1,1,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,1,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,0,0,0,12,12,12,12,12,12,12,12,12,11,11,11,1,1,11,11,11,11,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,1,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,15,15,15,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,1,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,1,12,12,12,12,12,12,12,12,1,1,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,1,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,1,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,14,14,12,12,12,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,14,14,12,12,12,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,14,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,1,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,1,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,1,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,1,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,1,1,1,1,11,11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,11,11,11,11,11,12,12,12,12,12,12,12,12,12,12,11,11,1,1,1,12,12,12,12,12,12,12,12,12,12,12,11,11,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,12,12,12,12,12,12,12,11,11,11,11,11,11,11,1,1,12,12,12,12,12,14,14,12,12,12,12,11,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,12,12,12,12,12,14,14,12,12,12,12,1,11,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,12,12,12,12,12,14,14,12,12,12,12,1,11,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,1,11,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,14,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,15,15,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,14,15,15,15,15,15,15,15,15,15,14,15,15,15,15,15,15,15,15,15,15,22,22,22,22,22,22,22,22,22,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15];
  localplayer.world = "ruin";
}

function loadGrove() {
  roomGrid =
       [15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,21,21,21,21,21,21,21,21,21,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,14,14,14,14,12,12,14,14,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,20,15,15,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,15,15,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,20,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,15,15,15,15,15,15,15,15,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,15,15,15,15,15,15,15,15,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,20,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,12,12,12,12,12,12,14,14,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,12,12,14,14,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,12,12,14,14,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,20,12,12,12,12,12,14,14,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,14,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,15,15,20,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,15,15,14,14,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,14,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,15,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,15,15,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,14,15,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,14,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,15,15,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,14,15,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,14,12,12,12,12,12,0,0,0,12,12,12,0,0,0,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,14,0,12,12,12,12,0,20,0,12,12,12,0,20,0,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,14,14,12,12,12,12,0,0,0,12,12,12,0,0,0,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,15,15,15,15,15,12,12,12,12,12,12,12,12,14,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,20,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,15,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,15,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,15,15,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,15,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,12,13,12,12,12,12,12,12,12,12,12,13,13,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,13,13,12,12,12,12,12,12,12,12,12,13,13,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,12,12,13,13,12,12,12,12,12,12,12,12,12,13,13,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,14,12,12,12,12,12,15,13,13,13,12,12,12,12,12,12,12,12,12,13,13,13,12,12,12,12,12,12,12,12,12,12,12,12,12,15,15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,14,15,15,15,15,15,15,15,13,13,13,16,16,16,16,16,16,16,16,16,13,13,13,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15,15];
  localplayer.world = "grove";
}

function loadGlobal() {
  roomGrid =
       [10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,3,3,3,3,3,3,3,3,3,3,10,10,10,10,10,10,10,10,10,10,10,10,10,10,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,10,10,10,10,0,0,0,0,0,10,10,10,10,10,10,10,0,0,10,14,12,12,12,12,12,12,12,12,15,15,15,10,10,10,10,10,10,10,10,10,10,8,8,13,13,13,13,13,13,13,13,13,13,13,8,8,8,13,13,13,13,13,13,13,10,10,10,0,0,0,0,0,0,10,10,0,10,0,0,10,0,0,10,14,12,12,12,12,12,12,12,12,12,12,15,10,10,10,10,10,10,10,10,8,8,8,8,8,8,8,8,13,13,13,13,13,8,8,8,8,8,8,8,8,8,18,13,13,10,10,0,0,0,0,0,0,0,10,6,0,10,0,0,0,0,0,10,14,14,12,12,12,12,12,12,12,12,12,12,14,10,10,10,10,10,10,17,0,0,0,8,8,8,8,8,8,13,13,8,8,8,8,8,8,8,8,8,8,8,8,13,13,10,10,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,10,14,12,12,12,12,12,12,12,12,12,12,14,10,10,10,10,10,0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,10,10,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0,10,10,12,12,12,12,12,12,12,12,12,12,14,10,10,10,10,0,0,0,0,0,0,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,10,0,0,0,0,0,0,0,10,10,0,0,0,0,0,10,0,0,0,0,10,12,12,12,12,12,12,12,12,12,14,14,10,10,10,10,0,0,0,0,0,0,0,0,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,6,13,10,0,0,0,0,0,0,0,10,10,0,0,0,0,0,10,0,0,0,0,10,12,12,12,12,12,12,12,12,12,14,10,10,10,10,10,0,0,0,0,0,0,0,0,13,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,10,0,0,0,0,0,0,0,0,10,10,0,0,0,0,10,0,0,0,0,10,14,12,12,12,12,12,12,12,12,14,10,10,10,10,10,0,0,10,10,0,0,0,0,13,13,8,8,8,8,8,8,8,8,8,8,13,8,8,8,8,8,8,13,10,0,0,0,0,0,0,0,10,10,10,0,0,0,10,10,10,10,0,0,10,14,12,12,12,0,0,12,12,12,14,10,10,10,10,10,10,10,10,10,10,0,0,0,0,13,8,8,8,8,8,8,8,8,13,13,13,8,8,8,8,8,13,13,10,0,0,0,0,0,0,10,10,10,10,10,0,0,10,10,10,0,0,0,0,14,12,12,0,0,0,0,12,12,20,10,10,10,10,10,10,10,0,0,0,0,0,0,0,13,13,8,8,8,8,13,13,13,13,13,8,8,8,8,8,8,13,13,10,0,0,10,10,10,10,10,10,10,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,10,0,0,0,0,0,0,0,0,0,0,13,13,13,13,13,13,13,13,13,13,8,8,8,8,8,8,8,13,13,10,0,0,0,0,10,10,10,0,0,10,10,0,0,10,10,18,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,20,13,13,13,13,13,13,13,13,13,13,8,8,8,8,8,8,8,13,13,10,0,0,0,0,0,0,0,0,0,10,10,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,13,13,8,8,8,13,13,13,13,13,8,8,8,8,8,8,8,8,13,13,10,0,0,0,0,0,0,0,0,0,10,10,0,0,0,10,10,10,10,10,0,0,0,0,10,10,10,0,0,10,10,10,10,10,0,0,10,10,0,0,0,0,0,13,13,8,8,8,8,13,13,13,8,8,8,8,8,8,8,8,8,13,13,13,10,10,0,0,0,10,10,10,10,10,10,10,0,0,0,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,0,0,10,10,10,0,0,0,13,13,13,8,8,8,8,13,13,8,8,8,8,8,8,8,8,8,8,13,13,13,10,10,0,0,0,10,10,10,10,10,10,10,10,0,0,0,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,0,0,0,10,10,10,10,0,0,13,13,8,8,8,8,8,13,8,8,8,8,8,8,8,8,8,8,8,13,13,13,10,0,0,0,0,0,10,10,0,10,10,10,10,0,0,0,0,0,0,0,0,10,10,10,10,10,10,0,0,10,10,10,10,0,0,0,0,0,10,10,0,13,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,13,10,0,0,0,0,0,10,0,0,0,10,10,10,0,0,0,0,0,0,0,0,10,10,10,0,10,0,0,0,0,10,10,10,0,0,0,0,0,0,13,13,13,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,13,10,0,0,0,0,0,10,0,0,0,0,0,10,10,0,0,0,0,0,0,7,10,10,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,10,13,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,8,8,8,13,13,13,10,10,0,0,0,10,10,0,0,0,0,0,0,10,10,10,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,13,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,13,8,8,8,13,13,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,10,10,0,0,0,0,0,0,10,10,10,10,10,0,0,0,0,0,0,0,13,13,8,8,8,8,13,13,8,8,8,13,13,13,13,13,13,8,8,8,8,13,13,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,10,10,0,0,0,0,10,0,0,0,10,10,10,10,10,10,10,0,0,0,0,13,13,8,8,8,13,13,13,13,13,13,13,13,13,13,8,8,8,8,8,8,13,13,10,0,0,0,0,0,0,10,10,10,0,0,0,0,10,10,10,0,0,0,10,10,0,0,0,10,10,0,0,0,10,10,10,10,10,10,0,0,0,0,0,0,13,13,8,8,8,8,13,13,13,13,13,8,8,8,8,8,8,8,8,8,8,13,10,0,0,0,0,0,0,0,0,10,10,0,0,0,10,10,10,0,0,10,10,10,0,0,0,10,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,0,13,13,8,8,8,8,8,13,13,8,8,8,8,8,8,8,8,13,8,8,8,13,10,0,0,0,0,0,0,0,0,10,10,0,0,10,10,10,10,0,0,10,10,0,0,0,0,10,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,0,13,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,8,8,13,10,0,0,0,0,0,0,10,10,10,10,0,0,10,10,10,0,0,0,10,0,0,0,0,0,10,10,10,0,0,10,10,0,0,0,0,0,0,0,0,0,0,0,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,8,8,13,10,0,0,0,0,0,0,10,10,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,13,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,8,13,13,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,8,8,8,8,8,8,8,8,8,10,8,8,10,8,8,8,8,8,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,10,10,10,0,0,10,10,10,10,8,8,8,10,10,8,8,8,10,10,8,8,10,8,8,8,8,8,10,10,10,0,10,0,0,0,10,0,0,0,10,17,0,0,0,6,10,10,0,0,10,10,10,0,0,0,10,10,10,10,0,0,0,10,10,10,10,10,0,0,10,10,10,8,8,8,8,10,10,10,20,8,10,10,8,8,10,10,10,8,8,10,10,10,10,10,10,0,0,10,10,10,10,10,10,10,18,0,0,0,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,8,8,8,10,10,10,10,10,10,10,10,8,8,10,10,10,10,10,10,10,10,10,10,10,0,0,10,10,10,10,10,10,10,10,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,8,8,8,10,10,10,10,10,10,10,10,8,8,10,10,10,10,10,10,10,10,10,17,0,0,0,20,10,10,10,10,10,10,10,20,0,0,0,1,11,11,11,11,11,11,11,1,1,1,11,11,11,11,11,11,11,11,1,1,1,11,11,1,1,8,8,8,10,10,10,10,10,10,10,0,0,0,10,10,10,10,10,10,10,10,10,0,0,0,0,0,10,0,0,0,10,10,10,10,10,0,0,11,11,11,11,11,11,11,11,1,1,11,11,11,11,11,11,11,11,11,1,1,11,11,11,11,11,8,8,8,10,10,10,10,0,0,0,0,0,0,0,0,0,0,10,10,10,10,10,18,0,0,0,19,10,0,0,0,0,0,10,10,10,0,11,11,11,11,1,1,11,11,11,11,11,11,11,11,11,1,1,1,11,11,11,11,11,11,11,11,11,11,8,8,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,10,10,10,10,5,10,10,10,0,0,0,0,0,0,0,10,1,11,11,11,1,1,1,11,11,11,11,11,11,11,11,1,1,1,1,11,11,11,11,11,11,11,11,11,11,8,8,10,10,0,0,0,0,10,7,10,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,1,11,11,11,11,1,1,11,11,11,11,11,11,11,11,1,1,1,11,11,11,11,11,11,11,11,11,11,11,8,8,10,0,0,0,0,10,10,10,10,10,10,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,1,1,11,11,11,11,11,11,11,11,11,11,11,11,1,1,1,11,11,11,11,1,1,11,11,11,11,11,11,11,1,10,0,0,0,10,10,10,0,18,10,10,10,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,10,1,1,1,11,11,11,11,11,11,11,11,11,11,11,11,1,1,11,11,11,11,1,1,1,1,1,1,11,11,11,1,10,0,0,0,10,10,10,0,0,0,0,10,10,0,0,0,0,10,10,10,0,0,10,10,10,10,10,10,10,0,0,0,10,1,1,1,11,11,11,11,11,11,1,1,11,11,11,11,1,1,11,11,11,11,1,1,1,1,1,1,11,11,11,1,10,0,0,0,0,0,0,0,0,0,0,10,10,0,0,0,0,10,10,10,0,0,10,10,10,10,10,10,0,0,0,0,10,1,1,11,11,11,11,11,11,1,1,1,1,1,11,11,11,1,11,11,11,11,1,1,1,1,1,11,11,11,11,1,10,10,0,0,0,0,0,0,0,0,0,0,10,10,0,0,10,10,10,0,0,0,10,10,10,6,0,0,0,0,0,0,10,1,11,11,11,11,11,11,11,11,11,1,1,1,11,11,11,1,11,11,11,11,11,1,1,7,11,11,11,11,11,1,10,10,0,0,0,0,0,0,0,0,0,0,10,10,0,0,10,10,10,0,0,0,10,10,0,0,0,0,0,0,0,0,10,1,11,11,11,1,11,11,11,11,11,11,11,1,11,11,11,1,1,11,11,11,11,1,1,11,11,11,11,11,11,1,10,10,0,0,0,0,0,0,0,0,0,0,7,10,0,0,0,10,10,0,0,0,10,0,0,0,0,0,0,0,0,0,0,10,1,11,11,1,1,11,11,11,11,11,11,1,11,11,11,1,1,1,11,11,11,1,1,11,11,11,11,11,11,1,1,10,0,0,0,0,0,0,0,0,0,0,0,10,0,0,0,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,1,11,11,1,1,11,11,11,11,11,11,1,1,6,1,1,1,11,11,11,11,1,1,1,11,11,11,11,11,11,11,1,10,10,10,10,20,10,10,10,0,0,0,10,10,0,0,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,1,19,1,1,1,1,11,11,11,11,11,1,1,1,1,1,1,11,11,11,11,1,1,1,11,11,11,11,11,11,11,1,10,10,10,10,10,10,10,10,0,0,0,10,10,0,0,10,10,10,0,0,0,0,10,0,0,0,0,10,0,0,0,10,1,1,1,1,1,1,1,1,1,11,11,1,1,1,1,1,11,11,11,11,11,17,1,1,1,11,11,11,11,11,11,1,10,10,10,10,10,10,10,10,0,0,10,10,0,0,0,10,10,10,0,0,0,10,10,10,10,10,10,10,0,0,0,10,1,1,1,1,1,1,1,1,1,11,11,1,1,1,1,1,11,11,11,11,11,11,11,1,1,11,11,11,11,11,11,11,1,10,0,0,10,10,10,0,0,0,10,10,0,0,10,10,10,0,0,0,0,10,10,10,10,10,10,10,0,0,0,10,1,1,1,11,11,11,19,1,1,11,11,11,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,1,10,0,0,0,10,10,0,0,10,10,10,0,0,10,10,10,0,0,0,0,0,10,0,0,20,10,10,0,0,0,10,11,11,11,11,11,11,11,1,1,11,11,11,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,1,1,1,11,1,10,0,0,0,0,0,0,0,10,10,10,0,0,10,10,10,10,0,0,0,0,10,0,0,0,10,0,0,0,0,10,11,11,11,11,11,11,11,1,1,1,11,11,11,11,11,1,11,11,11,11,11,11,11,11,11,11,11,1,1,1,1,1,1,10,0,0,0,0,0,0,0,0,10,10,0,0,10,10,10,10,0,0,0,10,10,0,0,0,10,0,0,0,10,1,11,11,1,1,1,11,11,1,1,1,1,1,11,11,11,1,11,11,11,11,11,11,11,11,11,11,11,1,1,1,1,1,1,1,10,0,0,0,0,0,0,0,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,0,10,0,0,0,10,1,11,11,1,1,1,11,11,1,1,1,1,1,11,11,11,1,1,11,11,1,1,11,11,11,11,11,11,11,11,11,11,1,1,1,10,10,0,0,0,0,0,0,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,0,10,0,0,0,10,1,11,11,11,1,1,1,11,11,1,11,11,1,11,11,11,1,1,11,11,1,1,1,11,11,11,11,11,11,11,11,11,11,11,11,1,10,0,0,0,0,0,0,10,10,0,0,0,10,10,10,10,0,0,0,0,0,0,0,10,0,0,0,10,1,11,11,11,11,1,1,11,11,1,11,11,11,11,11,11,1,11,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,11,1,1,10,0,0,0,0,0,0,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,10,0,0,0,10,1,11,11,11,11,1,1,11,11,1,11,11,11,11,11,11,1,11,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,1,10,0,0,0,0,0,0,10,10,0,0,10,10,10,0,0,0,0,0,0,0,0,10,6,0,0,10,1,11,11,11,11,1,1,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,1,10,0,0,0,0,0,0,10,0,0,0,10,10,10,0,0,0,0,0,0,0,0,10,10,0,0,10,1,11,11,11,1,1,11,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,1,1,11,11,11,11,11,11,11,1,0,0,0,0,0,0,0,0,0,0,6,10,10,10,10,10,10,10,10,0,0,10,10,10,0,0,10,1,11,11,1,1,1,11,11,11,1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,1,1,11,11,11,11,11,11,11,5,0,0,0,0,0,0,0,0,0,0,10,10,10,6,10,10,10,18,10,0,0,0,0,0,0,0,0,11,11,11,1,1,11,11,11,11,1,11,11,11,11,11,11,11,11,11,11,11,1,1,11,11,11,11,1,1,11,11,11,11,11,11,11,1,10,0,0,0,0,0,0,0,0,0,10,10,10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,11,11,1,1,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,11,1,1,1,11,11,1,1,1,1,11,11,11,1,1,1,1,10,10,0,0,0,0,0,0,0,0,10,10,10,19,0,0,0,0,0,0,0,0,10,10,10,10,10,1,11,1,1,1,1,1,11,11,11,11,11,1,1,1,11,11,1,1,11,1,1,1,1,1,11,1,1,1,1,1,11,1,1,1,1,1,10,10,10,10,10,0,0,0,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,10,10,10,10,10,10,10,10,10,10,10];
  localplayer.world = "global";
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
//---------------GENERAL TOOLS CODE--------
//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
function drawImageCenteredAtCoordWithRotation(image, x, y, angle) { // if rotation of image is needed
  canvasContext.save(); // allows to undo movement and rotate spin
  canvasContext.translate(x, y); // sets the point where graphic will go
  canvasContext.rotate(angle);    // sets the rotation
  canvasContext.drawImage(image, -image.width / 2, -image.height / 2);  // center, draw ----- where the rubber hits the road on image drawing
  canvasContext.restore(); // undo the translation movement and rotation since save()
}

function drawImageCenteredAtCoord(image,x,y) { // Same version without the rotation
  canvasContext.drawImage(image, (-image.width / 2) + x, (-image.height / 2) + y);  // ----- where the rubber hits the road on image drawing
}

function colorRect(x, y, width, height, color) { // draw any size/color rectangle anywhere specified
  canvasContext.fillStyle = color;
  canvasContext.fillRect(x, y, width, height);
}

function colorRectForMap(x, y, width, height, color) { // draw any size/color rectangle anywhere specified
  mapcanvasContext.fillStyle = color;
  mapcanvasContext.fillRect(x, y, width, height);
}

function colorRectOutline(x, y, width, height, color) { // draw any size/color rectangle anywhere specified
  canvasContext.strokeStyle = color;
  canvasContext.strokeRect(x, y, width, height);
}

function colorTextSmall(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function
  canvasContext.font="10px Verdana";
  canvasContext.fillStyle=fillColor;
  canvasContext.fillText(showWords, textX,textY);
}

function colorTextSmallShadow(showWords, textX,textY, fillColor, shadowcolor) { // 20px Verdana canvas Text function
  canvasContext.font="10px Verdana";
  canvasContext.fillStyle=shadowcolor;
  canvasContext.fillText(showWords, textX - 1,textY - 1);
  canvasContext.fillText(showWords, textX - 1,textY + 1);
  canvasContext.fillText(showWords, textX + 1,textY - 1);
  canvasContext.fillText(showWords, textX + 1,textY + 1);
  canvasContext.fillText(showWords, textX + 2,textY + 2);
  canvasContext.fillText(showWords, textX + 2,textY + 1);
  canvasContext.fillStyle=fillColor;
  canvasContext.fillText(showWords, textX,textY);
}

function colorTextMedium(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function
  canvasContext.font="16px Verdana";
  canvasContext.fillStyle=fillColor;
  canvasContext.fillText(showWords, textX,textY);
}

function colorTextCinzel(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function
  canvasContext.font="900 15px Cinzel Decorative";
  canvasContext.fillStyle=fillColor;
  canvasContext.fillText(showWords, textX,textY);
}

function colorTextCinzelHuge(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function
  canvasContext.font="900 32px Cinzel Decorative";
  canvasContext.fillStyle=fillColor;
  canvasContext.fillText(showWords, textX,textY);
}

function download(data, filename, type) { // Function to download data to a file
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"), url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0); 
  }
}

function makeRangeControl(x,y,width,height){
  let range={x:x,y:y,width:width,height:height};
  range.x1=range.x+range.width;
  range.y1=range.y;
  range.pct=0.50;
  return(range);
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Screen size and control section
function resize() { // resizes the canvas to the window width and height
  if (canvas.currentHeight !== window.innerHeight || canvas.currentWidth !== window.innerWidth) { // If we"re not already perfectly sized for width and height
    canvas.currentHeight = window.innerHeight; // Size us with the height first
    ratio = window.innerWidth / window.innerHeight; // Then compute the aspect ratio of the window  
    canvas.currentWidth = canvas.currentHeight * ratio; // And resize the width to that ratio
    scalex = canvas.currentWidth / canvas.width; // Our scale can now be computed based upon the original width
    scaley = canvas.currentHeight / canvas.width; // And height of the canvas vs it"s new size, which we"ll need for correct input
    canvas.style.width = canvas.currentWidth + "px"; // scale the canvas with CSS
    canvas.style.height = canvas.currentHeight + "px";
  }
}

// function toggleFullscreen(elem) { // Flips back and forth from normal to fullscreen on compatable devices
//     // if(usingTouchScreen){return;}
//   elem = elem || document.documentElement;
//   if (!document.fullscreenElement && !document.mozFullScreenElement &&
//     !document.webkitFullscreenElement && !document.msFullscreenElement) {
//     if (elem.requestFullscreen) {
//       elem.requestFullscreen();
//     } else if (elem.msRequestFullscreen) {
//       elem.msRequestFullscreen();
//     } else if (elem.mozRequestFullScreen) {
//       elem.mozRequestFullScreen();
//     } else if (elem.webkitRequestFullscreen) {
//       elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
//     }
//   } else {
//     if (document.exitFullscreen) {
//       document.exitFullscreen();
//     } else if (document.msExitFullscreen) {
//       document.msExitFullscreen();
//     } else if (document.mozCancelFullScreen) {
//       document.mozCancelFullScreen();
//     } else if (document.webkitExitFullscreen) {
//       document.webkitExitFullscreen();
//     }
//   }
// }

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Input and Calcuation Section
function calculateMousePos(e) {// returns calculateMousePos.x and calculateMousePos.y values
  rect = canvas.getBoundingClientRect(); // Get the size of the canvas
  root = document.documentElement; // Get the document root from the DOM
  if ((e.clientX)&&(e.clientY)) { // if it seems like mouse based input
    mouseX = e.clientX - rect.left - root.scrollLeft; // Get the origin for the Left
    mouseY = e.clientY - rect.top - root.scrollTop; // and top sides of the screen
    consoleMousePos = " MouseX: " + mouseX + "mouseY: " + mouseY; // calculate the raw mouse position
    consoleMousePosAfterScale = "mouseX: " + Math.floor(mouseX/scalex) + "mouseY: " + Math.floor(mouseY/scaley); // Display mouse pos after scaling 
  } else if (e.targetTouches) { // Or if it seems like a touch interface
    mouseX = Math.floor(e.targetTouches[0].clientX - rect.left - root.scrollLeft); // Get the origin for the Left
    mouseY = Math.floor(e.targetTouches[0].clientY - rect.top - root.scrollTop); // and top sides of the screen
    e.preventDefault(); // prevent default behavior that might set off swipe or resize hooks
  }
  return { // Return the values from inputs and place them in the mouse x/y variables
    x: mouseX,
    y: mouseY
  };
}

function getTileIndexAtPixelCoord(pixelX, pixelY) { // Find a tile based on an x/y position
  tileCol = Math.floor(pixelX / TILE_WIDTH);
  tileRow = Math.floor(pixelY / TILE_HEIGHT);
  if (tileCol < 0 || tileCol >= ROOM_COLUMNS || // Error Checking for out of range values
    tileRow < 0 || tileRow >= ROOM_ROWS) {
    return undefined; // enable error handling
  }
  tileIndex = roomTileToIndex(tileCol, tileRow);
  return tileIndex;
}

function roomTileToIndex(x, y) { // tile index calculator -- used with above function
  return (x + ROOM_COLUMNS * y);
}

function tileTypeHasTransparency(checkTileType) { // checks for transparency from list of marked images
  return (checkTileType == TILE_GROVE_BOTTOM ||
    checkTileType == TILE_RUIN_BOTTOM ||
    checkTileType == TILE_GROVE_TOP ||
    checkTileType == TILE_GLOBAL ||
    checkTileType == TILE_CHEST ||
    checkTileType == TILE_LONGSWORD ||
    checkTileType == TILE_SHORTSWORD ||
    checkTileType == TILE_SPEAR ||
    checkTileType == TILE_HEALPOTION ||
    checkTileType == TILE_BLUECUBE ||
    checkTileType == TILE_TURQUISECUBE ||
    checkTileType == TILE_DOOR);
}

function isScaledMouseOverBox(x1,x2,y1,y2) { // Calculate whether scaled input fits within any box
  if (Math.floor(mousePos.x/scalex) > x1 && Math.floor(mousePos.x/scalex) < x2 && Math.floor(mousePos.y/scaley) > y1 && Math.floor(mousePos.y/scaley) < y2) {
    return true;
  } else {
    return false;
  }
}



function rowColToArrayIndex(col, row) { // calculate the index within the column array based on position
  return col + ROOM_COLUMNS * row;
}

function downloadMap() {
  download(roomGrid, "roomgrid", "text/txt");
}


/**
 * Determine the mobile operating system.
 * This function returns one of 'iOS', 'Android', 'Windows Phone', or 'unknown'.
 *
 * @returns {String}
 */

function getOS() {
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}

os = "";

function checkForMobileMac() {
  if (iOS === "") {
    if (getMobileOperatingSystem() === 'iOS') {
      iOS = "yes"
    }
  }
}

function getOS() { // More specific OS detection
  var userAgent = window.navigator.userAgent,
      platform = window.navigator.platform,
      macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
      windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
      iosPlatforms = ['iPhone', 'iPad', 'iPod'],
      os = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = 'Mac OS';
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = 'iOS';
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = 'Windows';
  } else if (/Android/.test(userAgent)) {
    os = 'Android';
  } else if (!os && /Linux/.test(platform)) {
    os = 'Linux';
  }

  return os;
}



window.onblur = function() { // Suspend sound if focus is lost
    if (!locked) {
        soundcontext.suspend();
    }
};

window.onfocus = function() { // Resume sound if focus is gained
    if (!locked) {
        soundcontext.resume();
    }
};

function playForIOS(decodeData) { // function to play the audio
        console.log("playForIOS is running");
        soundcontext.decodeAudioData(decodeData, function(buffer) {
        // if (errored) {
        //     return;
        // }
        var source = soundcontext.createBufferSource();
        source.buffer = buffer;
        source.connect(soundcontext.destination);
        source.start();
    }, function() {} );
}



// requestBoom.onload = function() {
//     if (errored) {
//         return;
//     }
  
//         console.log("Onload- play for IOS")
//         playForIOS(requestBoom.response);

// };


//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Image loading Section  --- Fires before actual game during Loading Screen
function loadLoyalImages () { // tracking of all external graphical resources and load mechanism
  loadImageForRoomCode(TILE_GROUND, "https://goo.gl/4xLZ7T");
  loadImageForRoomCode(TILE_GROUND2, "https://goo.gl/4xLZ7T");
  loadImageForRoomCode(TILE_GROUND3, "https://goo.gl/HWzcsu");
  loadImageForRoomCode(TILE_GROUND4, "https://goo.gl/B6mgP1");
  loadImageForRoomCode(TILE_WALL, "https://goo.gl/4xLZ7T");
  loadImageForRoomCode(TILE_WALL2, "https://goo.gl/4xLZ7T");
  loadImageForRoomCode(TILE_WALL3, "https://goo.gl/dj2XDf");
  loadImageForRoomCode(TILE_WALL4, "https://goo.gl/B6mgP1");
  loadImageForRoomCode(TILE_WALL5, "https://goo.gl/B6mgP1");
  loadImageForRoomCode(TILE_WALL6, "https://goo.gl/B6mgP1");
  loadImageForRoomCode(TILE_GROVE_BOTTOM, "https://goo.gl/B6mgP1"); // Temp for now until we decide a goal graphic
  loadImageForRoomCode(TILE_GROVE_TOP, "https://goo.gl/B6mgP1"); // Temp for now until we decide a goal graphic
  loadImageForRoomCode(TILE_RUIN_BOTTOM, "https://goo.gl/B6mgP1"); // Temp for now until we decide a goal graphic
  loadImageForRoomCode(TILE_GLOBAL, "https://goo.gl/B6mgP1"); // Temp for now until we decide a goal graphic
  loadImageForRoomCode(TILE_PLAYER, "https://goo.gl/B6mgP1"); // Temp for now until we reallocate Player tile
  loadImageForRoomCode(TILE_CHEST, "https://goo.gl/NVTK5v");/// FObar636 1219
  loadImageForRoomCode(TILE_DOOR, "https://goo.gl/dj2XDf");
  loadImageForRoomCode(TILE_BLUECUBE, "https://goo.gl/456GW2");
  loadImageForRoomCode(TILE_TURQUISECUBE, "https://goo.gl/456GW2");
  loadImageForRoomCode(TILE_LONGSWORD, "https://goo.gl/456GW2");
  loadImageForRoomCode(TILE_SHORTSWORD, "https://goo.gl/456GW2");
  loadImageForRoomCode(TILE_SPEAR, "https://goo.gl/456GW2");
  loadImageForRoomCode(TILE_HEALPOTION, "https://goo.gl/456GW2");
  imagesLoaded = imageArray.length + tilePics.length;
  countDownImagaes();
}

function countDownImagaes() {
  for (let j = 0; j<imageArray.length; j+=1) {
    beginLoadingImage(imageArray[j].varName, imageArray[j].fileName);
  }
}

function beginLoadingImage(imgVar, fileName) { // For creating a que of non-tile images to be loaded
  imgVar.onload = startGameIfImagesLoaded;
  imgVar.src = fileName;
}

function startGameIfImagesLoaded() {
  imagesLoaded-=1; // Count the Number of Images waiting down by one
  if(imagesLoaded === 0) {  // if it gets to 0, launch the game   
    requestAnimationFrame(playLoyal);
  } else {
    drawLoadingScreen();
  }
}

function drawLoadingScreen() {
  resize();
  colorRect(0,0, 400,400, "black");
  colorTextCinzelHuge("LOADING GAME", 200,200, "white");
  colorRect(0,300, (Math.floor(400*(1-(imagesLoaded/(imageArray.length + tilePics.length))))), 50, "red"); // Draw loading bar 
}

function loadImageForRoomCode(roomCode, fileName) { // for world tiles - still passed to beginLoadingImage
  tilePics[roomCode] = document.createElement("img");
  beginLoadingImage(tilePics[roomCode], fileName);
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Input Section
function handleSettingsMenuClicks() {
  if (isScaledMouseOverBox(1,108,370,400)) { // if fullscreen is clicked
    toggleFullscreen(); // toggle the fullscreen setting
  } else if (isScaledMouseOverBox(109,197,370,400)) { // if exit realm is clicked
    sendSingleLeavePing();
    removeAllSubscriptions();
    saveCharacter();








    location = lobbyUrl;
    playLoyal = null;












  }  else if (isScaledMouseOverBox(0,100,0,30)) { // if Character is clicked
    menudisplayed = "character";
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } else if (isScaledMouseOverBox(100,200,0,30)) { // if map is clicked
    menudisplayed = "map";
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } else if (isScaledMouseOverBox(1,108,320,350)) { // if Show Boxes is clicked
    if(boxesareshowing) { // Toggle Show Boxes
        boxesareshowing = false;
    } else {
        boxesareshowing = true;
    }
  } else if (isScaledMouseOverBox(109,197,320,350)) { // if Debug is clicked
    if(debugisshowing) { // Toggle debug display
        debugisshowing = false;
    } else {
        debugisshowing = true;
    }
  } else if (isScaledMouseOverBox(109,197,270,300)) { // if Mute is clicked
    muteSoundEffects();
  }
}

function muteSoundEffects() {
  if(muteactive) {  
    muteactive = false;   
    firstLevelMusic.volume = 0.5;
    effectsgainvalue = 0.5;  
  } else {   
    muteactive = true; 
    firstLevelMusic.volume = 0;
    effectsgainvalue = 0;  
  }
}

function handleCharacterMenuClicks() {
  if (isScaledMouseOverBox(0,100,0,30)) { // if Settings is clicked
    menudisplayed = "settings";
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } else if (isScaledMouseOverBox(100,200,0,30)) { // if map is clicked
    menudisplayed = "map";
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } 
}

function handleMapMenuClicks() {
  if (isScaledMouseOverBox(0,100,0,30)) { // if Character is clicked
    menudisplayed = "character";
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } else if (isScaledMouseOverBox(100,200,0,30)) { // if settings is clicked
    menudisplayed = "settings";
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } else if (isScaledMouseOverBox(0,129,360,390)) { // if clear history
    drawMapDisplay(); // Clear the history line of player by redrawing the map to the mapcanvas
  }   
}

function handleMenuClicks() { // handle clicks for the different Menu"s
  if(menudisplayed === "settings") {
    handleSettingsMenuClicks();
  } else if (menudisplayed === "character") {
    handleCharacterMenuClicks();  
  } else if (menudisplayed === "map") {
    handleMapMenuClicks();
  }
}

function deleteCharacterAndRefresh() {
  deleteCharacter();
  setTimeout(function(){
    gon.watch("mycharacters", getCharacters); // Snags the user object from Ruby, and passes it to the getCharacters Callback
    characterSelectScreenActive = true;
    selectKillActive = false;  
    showingDeleteConfirm = false;
    selectionColor = 'grey';
  }, 700);
}

function handleCharacterSelectClicks() { // Just for the character select area
  // Create array of click ranges based upon character list of any size
  if (isScaledMouseOverBox(240,400,360,400) && charactersholder.length < 4) {
    // location = "/characters/new";
    characterSelectScreenActive = false;
    showingCreateCharacter = true;
  }
  if (isScaledMouseOverBox(130,250,360,400) && charactersholder.length > 3) {
    selectKillActive = true;
    selectionColor = "red";
  }
  if (isScaledMouseOverBox(0,110,370,400)) { // If Fullscreen is pressed
    toggleFullscreen();
  }
  handleCharacterSelectLoop();
  if (isScaledMouseOverBox(200,295,200,240) && selectKillActive  && showingDeleteConfirm) { 
    // Cancel the Deletion of a Character
    selectKillActive = false;
    showingDeleteConfirm = false;
    selectionColor = 'grey';
  }
  if (isScaledMouseOverBox(105,200,200,240) && selectKillActive  && showingDeleteConfirm) { 
    deleteCharacterAndRefresh();
  }
}  // End of handleCharacterSelect

function handleCharacterSelectLoop() {
  for (cha = 0; cha < charactersholder.length; cha+= 1) {
    if (mousePos.y/scaley > 80 + (60 * cha) && mousePos.y/scaley < 120 + (60 * cha) && !selectKillActive && !showingDeleteConfirm) {
      chosenCharacter = charactersholder[cha];
      handleCharacterSelectionTypes();      
    } else if (mousePos.y/scaley > 80 + (60 * cha) && mousePos.y/scaley < 120 + (60 * cha) && selectKillActive && !showingDeleteConfirm) {
      setTimeout(function(){ // First show confirmation dialoge
        showingDeleteConfirm = true;
      }, 500);
      chosenCharacter = charactersholder[cha]; 
    } // End of else if for confirm
  } // End of for Loop   
} // End of handleCharacterSelectLoop

function handleCharacterSelectionTypes() {
  let spawnx = 0;
  let spawny = 0;
  if(chosenCharacter.world === "global") { // if conditions based upon spawning in different maps
    if(chosenCharacter.current_xp > 20) {
      spawnx = 800;
      spawny = 100;
      switchGlobal();
    } else {
      spawnx = 150;
      spawny = 150;
      switchGlobal();
    }
  } else if (chosenCharacter.world === "grove") {
    spawnx = 460;
    spawny = 1950;
    switchGrove("bottom");
  } else if (chosenCharacter.world === "ruin") {
    spawnx = 460;
    spawny = 1950;
    switchRuin("bottom");
  }
  if (chosenCharacter.sprite === "prince") {
    localplayer.init(princePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;    
  } else if (chosenCharacter.sprite === "knight") {
    localplayer.init(knightPic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "mage") {
    localplayer.init(magePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "femaleknight") {
    localplayer.init(femaleknightPic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "elfmale") {
    localplayer.init(elfmalePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "elffemale") {
    localplayer.init(elffemalePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "darkelffemale") {
    localplayer.init(darkelffemalePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "darkelfmale") {
    localplayer.init(darkelfmalePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "normalgirl") {
    localplayer.init(normalgirlPic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "bard") {
    localplayer.init(bardPic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "darkelfmale") {
    localplayer.init(darkelfmalePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else if (chosenCharacter.sprite === "elfmale") {
    localplayer.init(elfmale, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  } else {
    localplayer.init(princePic, chosenCharacter.name, spawnx, spawny); 
    characterSelectScreenActive = false;
  }
  localplayer.weapon = chosenCharacter.weapon;
}

function showDeleteCharacterConfirmation() {
  colorRect(105, 160, 190, 80, 'blue');
  colorRect(105, 200, 95, 40, 'pink');
  colorRect(200, 200, 95, 40, 'teal');
  colorTextCinzelHuge('CONFIRM', 197,190, "black");
  colorTextCinzelHuge('YES', 155,232, "black");
  colorTextCinzelHuge('NO', 245,232, "black");
}

function handleIntroClicks() {
  if (isScaledMouseOverBox(310,400,370,400)) { // If Skip is pressed
    showingintro = false;
  }
  if (isScaledMouseOverBox(0,110,370,400)) { // If Skip is pressed
    toggleFullscreen();
  }
}

function handleClicks() { // Location of mouse clicks/screen touches and variables they coincide with-- Main switchboard
  if (showingintro) {
    handleIntroClicks();
  } else if (editorActive) { 
    editorInput(); // Handle Editor clicks
  } else {
    if (characterSelectScreenActive) {
      handleCharacterSelectClicks();
    } else if (showingCreateCharacter) {
      handleCreateCharacterClicks();
    }
    else {
      handleGamePlayClicks();   
    }  
  }      
}

function createCharacterAndRefresh() {
  createCharacter();
  runningCharacterDelay = true;
  setTimeout(function(){
  gon.watch("mycharacters", getCharacters); // Snags the user object from Ruby, and passes it to the getCharacters Callback
  characterSelectScreenActive = true;
  showingCreateCharacter = false;
  }, 700);
}

function handleCreateCharacterClicks() {
  if (isScaledMouseOverBox(210,400,370,400)) { // if under the create character button
        createCharacterAndRefresh();
  }
  if (isScaledMouseOverBox(10,82,300,370)) { // If Prev is pressed
    selectedClass-=1;
  }
  if (isScaledMouseOverBox(92,155,300,370)) { // If Next is pressed
    selectedClass+=1;
  }
  if (isScaledMouseOverBox(0,110,370,400)) { // If Fullscreen is pressed
    toggleFullscreen();
  }
  if (isScaledMouseOverBox(180,400,50,80)) { // if under the input text button
    runningNameBoxDelay = true; // focus keyboard on text field button
    enterNameHasBeenClicked = true;
  }
  if(selectedClass > 9) { // Loop though character list
    selectedClass = 0;
  } else if (selectedClass < 0) {
    selectedClass = 9;
  }
}

function runNameBoxDelay() {
  if(nameBoxDelay < 20) {
    nameBoxDelay+=1;
  } else {
    document.getElementById("namebox").value = "";
    document.getElementById("namebox").focus();
    document.getElementById("namebox").select();
    runningNameBoxDelay = false;
    nameBoxDelay = 0;
  }
}

function handlePlayerDiedClicks() {
    if (isScaledMouseOverBox(100,210,130,160)) { // Just observe clicked
        justObserving = true;
        saveCharacter();
    } 
    if (isScaledMouseOverBox(210,300,130,160)) {  // Quit is clicked
        sendSingleLeavePing();
        removeAllSubscriptions();
        saveCharacter();
        playLoyal = null;
        location = lobbyUrl;    
    } 
}

function handleReloadMenuClicks() {
  if (isScaledMouseOverBox(298,349,13,23) && reloadscreenactive) {
    location = location; // If reloadscreen is active and reload button is clicked
    playLoyal = null;
  } 
  if (isScaledMouseOverBox(352,400,13,23) && reloadscreenactive) { // if reload screen active and hide is clicked
    reloadscreenactive = false;
    reloadscreenhidden = true;
  } 
}

function handleMainScreenClicks() {
  if(menuactive) {
    if (isScaledMouseOverBox(202,237,350,385)) {// If Menu button is clicked and menuactive is true
      menuactive = false;
    } else {
      trackClicksWhileMenuOpen();
    }
  } else if (!menuactive){
    handleGameMapClicks();
  }
}

function handleGameMapClicks() {
  if (isScaledMouseOverBox(2,37,350,385) && !menuactive) {// If Menu button is clicked and menuactive is false
    menuactive = true;
    menuBackgroundPosX = 0;
    menuBackgroundPosX2 = 256;
  } else {// normal world input with no adjustment
    localplayer.gotoX = Math.floor(mousePos.x/scalex) + camPanX; // Set the GoTo values for x and y of Unit
    localplayer.gotoY = Math.floor(mousePos.y/scaley) + camPanY;
  }
}

function handleGamePlayClicks() {
  if(!localplayer.alive) {
    handlePlayerDiedClicks();
  } else { // gameplay with or without menu
    handleReloadMenuClicks();
    handleMainScreenClicks();  
  }
}

function trackClicksWhileMenuOpen() { // Special running condition for gameplay while menu open
  if(mouseX/scalex > 200) { // adjust mouse click data for CamPamX // If the mouse is off the menu (on right side of canvas when menu is)
    localplayer.gotoX = Math.floor(mousePos.x/scalex) + camPanX - 100; // Set the GoTo values for x and y of Unit
    localplayer.gotoY = Math.floor(mousePos.y/scaley) + camPanY;
  } else { // menu is active but not on world screen
    
    handleMenuClicks(); // This area is for menu input
  }
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
//---------------GAME CLASSES--------
//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
const Character  = (id,x,y,collisionbox,deltaX,deltaY,distToGo,moveX,moveY,walkIntoTileType,walkIntoTileIndex,animationiterator,direction,alive,invulnerable,invulnerablecounter,deathanimationcounter,current_xp,xp_since_starting,maxhitpoints,currenthitpoints,gold,character_class,attackbox,damage,sincelastattack,weaponspeed,weapon,sinceLastSeen,world) => {
  let state = {
    id,
    x,
    y,
    collisionbox,
    deltaX,
    deltaY,
    distToGo,
    moveX,
    moveY,
    walkIntoTileType,
    walkIntoTileIndex,
    animationiterator,
    direction,
    alive,
    invulnerable,
    invulnerablecounter,
    deathanimationcounter,
    current_xp,
    xp_since_starting,
    maxhitpoints,
    currenthitpoints,
    gold,
    character_class,
    attackbox,
    damage,
    sincelastattack,
    weaponspeed,
    weapon,
    sinceLastSeen,
    world
  }
  return Object.assign(
    state,
    handleFacingTrait(state),
    decideFacingTrait(state),
    moveTrait(state),
    checkTilesTrait(state),
    flipTileTrait(state),
    takeDamageTrait(state),
    resetTrait(state),
    drawTrait(state),
    handleInvulnerableTrait(state),
    drawDeathAnimationTrait(state),
    remoteInitCharacterTrait(state),
    initCharacterTrait(state),
    changeWeaponTrait(state),
    applyWeaponTrait(state),
    lastSeenIncrementTrait(state),
    handleAttackBoxTrait(state)
  )
}

const handleAttackBoxTrait = (state) => ({
  handleAttackBox: () => {
    if(state.weapon === "dagger") {
      if(state.direction === "down") {
        state.attackbox = [state.x - 10, state.y + 30, 20, 10];
      } else if (state.direction === "up") {
        state.attackbox = [state.x - 10, state.y - 40, 20, 10];
      } else if (state.direction === "right") {
        state.attackbox = [state.x + 30, state.y - 10, 10, 20];
      } else if ( state.direction === "left") {
        state.attackbox = [state.x - 40, state.y - 10, 10, 20];
      } // ENd of if direction
    } else if (state.weapon === "short sword") {
      if(state.direction === "down") {
        state.attackbox = [state.x - 10, state.y + 30, 20, 20];
      } else if (state.direction === "up") {
        state.attackbox = [state.x - 10, state.y - 50, 20, 20];
      } else if (state.direction === "right") {
        state.attackbox = [state.x + 30, state.y - 10, 20, 20];
      } else if ( state.direction === "left") {
        state.attackbox = [state.x - 50, state.y - 10, 20, 20];
      } // ENd of if direction
    } else if (state.weapon === "long sword") {
      if(state.direction === "down") {
        state.attackbox = [state.x - 10, state.y + 40, 20, 20];
      } else if (state.direction === "up") {
        state.attackbox = [state.x - 10, state.y - 60, 20, 20];
      } else if (state.direction === "right") {
        state.attackbox = [state.x + 40, state.y - 10, 20, 20];
      } else if ( state.direction === "left") {
        state.attackbox = [state.x - 60, state.y - 10, 20, 20];
      } // ENd of if direction
    } else if (state.weapon === "spear") {
      if(state.direction === "down") {
        state.attackbox = [state.x - 10, state.y + 60, 20, 10];
      } else if (state.direction === "up") { 
        state.attackbox = [state.x - 10, state.y - 70, 20, 10];
      } else if (state.direction === "right") {  
        state.attackbox = [state.x + 60, state.y - 10, 10, 20];
      } else if ( state.direction === "left") { 
        state.attackbox = [state.x - 70, state.y - 10, 10, 20];
      } // ENd of if direction
    }  
  }
})

const lastSeenIncrementTrait = (state) => ({
  lastSeenIncrement: () => {
    state.sinceLastSeen+= 1;
    if (state.sinceLastSeen > 2100) {
      state.sinceLastSeen = 0;
    }
  }
})

const applyWeaponTrait = (state) => ({
  applyWeapon: () => {
    if(state.weapon === 'dagger') {
      state.weaponspeed = 20;
      state.damage = 5;
    } else if (state.weapon === 'short sword') {
      state.weaponspeed = 30;
      state.damage = 8;
    } else if (state.weapon === 'long sword') {
      state.weaponspeed = 40;  // Apply speed
      state.damage = 10; // Apply damage
    } else if (state.weapon === 'spear') {
      state.weaponspeed = 40; // Apply speed
      state.damage = 7; // Apply damage
    }
  }
})

const changeWeaponTrait = (state) => ({
  changeWeapon: () => {
    let randNum = Math.random();
    if (randNum < 0.2) {
      quickTipActive = true;
      quickTipString = "Using Spear";
      quickTipTime = 1;
      state.weapon = 'spear';
    } else if (randNum > 0.2 && randNum < 0.6) {
      quickTipActive = true;
      quickTipString = "Using Short Sword";
      quickTipTime = 1;
      state.weapon = 'short sword';
    } else {
      quickTipActive = true;
      quickTipString = "Using Long Sword";
      quickTipTime = 1;
      state.weapon = 'long sword';
    }
  }
})

const remoteInitCharacterTrait = (state) => ({
  remoteInit: (whichGraphic, whichName, x,y) => {
    state.myBitmap = whichGraphic;
    state.myName = whichName;
    state.reset(x,y); // Spawn point is hard coded for now to separate from Tile Map
    state.maxhitpoints = 30;
    state.currenthitpoints = 30;
    state.invulnerable = false;
    state.attackbox = [0,0, 0,0];
    state.applyWeapon(state.weapon);
    state.weapon = "dagger";
    state.sincelastattack = 0;
    state.alive = true;
    state.collisionbox = 10;
    state.animationiterator = 0;
    state.deathanimationcounter = 0;
    state.invulnerablecounter = 0;
    state.damage = 2;
    state.weapon = "dagger";
    state.sinceLastSeen = 0;
    state.direction = "down";
  }
})

const initCharacterTrait = (state) => ({
  init: (whichGraphic, whichName, x,y) => {
    state.myBitmap = whichGraphic;
    state.myName = chosenCharacter.name;
    state.character_class = chosenCharacter.character_class;
    state.gold = chosenCharacter.gold;
    state.current_xp = chosenCharacter.current_xp;
    state.id = chosenCharacter.id;
    state.world = chosenCharacter.world;
    state.reset(x,y); // Spawn point is hard coded for now to separate from Tile Map
    state.attackbox = [0,0, 0,0];
    state.applyWeapon(state.weapon);
    state.sincelastattack = 0;
    if (state.current_xp > 2000 && state.current_xp < 4000) {
      state.maxhitpoints = 40;
      state.currenthitpoints = 40;
    } else if (state.current_xp > 4000 && state.current_xp < 8000) {
      state.maxhitpoints = 50;
      state.currenthitpoints = 50;
    } else if (state.current_xp > 8000 && state.current_xp < 18000) {
      state.maxhitpoints = 60;
      state.currenthitpoints = 60;
    } else if (state.current_xp > 18000 && state.current_xp < 35000) {
      state.maxhitpoints = 70;
      state.currenthitpoints = 70;
    } else if (state.current_xp > 35000 && state.current_xp < 70000) {
      state.maxhitpoints = 80;
      state.currenthitpoints = 80;
    } else if (state.current_xp > 70000 && state.current_xp < 125000) {
      state.maxhitpoints = 90;
      state.currenthitpoints = 90;
    } else if (state.current_xp > 125000 && state.current_xp < 250000) {
      state.maxhitpoints = 100;
      state.currenthitpoints = 100;
    } else if (state.current_xp > 250000 && state.current_xp < 500000) {
      state.maxhitpoints = 110;
      state.currenthitpoints = 110;
    } else if (state.current_xp > 500000 && state.current_xp < 750000) {
      state.maxhitpoints = 120;
      state.currenthitpoints = 120;
    } else if (state.current_xp > 750000 && state.current_xp < 1000000) {
      state.maxhitpoints = 130;
      state.currenthitpoints = 130;
    } else {
      state.maxhitpoints = 30;
      state.currenthitpoints = 30;
    } 
    state.invulnerable = false;
    state.alive = true;
    state.collisionbox = 10;
    state.animationiterator = 0;
    state.deathanimationcounter = 0;
    state.invulnerablecounter = 0;
    state.damage = 2;
    state.weapon = "dagger";
    state.direction = "down";
  }
})

const EnemyBanshee = (myID,x,y,collisionbox,deltaX,deltaY,distToGo,moveX,moveY,walkIntoTileType,walkIntoTileIndex,animationiterator,direction,alive,invulnerable,invulnerablecounter,deathanimationcounter,maxhitpoints,currenthitpoints,damage,updatesreceived,updatessent,decidecounter,enemytype) => {
  let state = {
    myID,
    x,
    y,
    collisionbox,
    deltaX,
    deltaY,
    distToGo,
    moveX,
    moveY,
    walkIntoTileType,
    walkIntoTileIndex,
    animationiterator,
    direction,
    alive,
    invulnerable,
    invulnerablecounter,
    deathanimationcounter,
    maxhitpoints,
    currenthitpoints,
    damage,
    updatesreceived,
    updatessent,
    decidecounter,
    enemytype
  }
  return Object.assign(
    state,
    handleFacingTrait(state),
    decideFacingTrait(state),
    moveTrait(state),
    checkTilesTrait(state),
    flipTileTrait(state),
    takeDamageTrait(state),
    resetTrait(state),
    drawTrait(state),
    handleInvulnerableTrait(state),
    drawDeathAnimationTrait(state),
    initBansheeTrait(state)
  )
}

const EnemySkeleton = (myID,x,y,collisionbox,deltaX,deltaY,distToGo,moveX,moveY,walkIntoTileType,walkIntoTileIndex,animationiterator,direction,alive,invulnerable,invulnerablecounter,deathanimationcounter,maxhitpoints,currenthitpoints,damage,updatesreceived,updatessent,decidecounter,enemytype) => {
  let state = {
    myID,
    x,
    y,
    collisionbox,
    deltaX,
    deltaY,
    distToGo,
    moveX,
    moveY,
    walkIntoTileType,
    walkIntoTileIndex,
    animationiterator,
    direction,
    alive,
    invulnerable,
    invulnerablecounter,
    deathanimationcounter,
    maxhitpoints,
    currenthitpoints,
    damage,
    updatesreceived,
    updatessent,
    decidecounter,
    enemytype
  }
  return Object.assign(
    state,
    handleFacingTrait(state),
    decideFacingTrait(state),
    moveTrait(state),
    checkTilesTrait(state),
    flipTileTrait(state),
    takeDamageTrait(state),
    resetTrait(state),
    drawTrait(state),
    handleInvulnerableTrait(state),
    drawDeathAnimationTrait(state),
    initSkeletonTrait(state)
  )
}

const EnemyBat = (myID,x,y,collisionbox,deltaX,deltaY,distToGo,moveX,moveY,walkIntoTileType,walkIntoTileIndex,animationiterator,direction,alive,invulnerable,invulnerablecounter,deathanimationcounter,maxhitpoints,currenthitpoints,damage,updatesreceived,updatessent,decidecounter,enemytype) => {
  let state = {
    myID,
    x,
    y,
    collisionbox,
    deltaX,
    deltaY,
    distToGo,
    moveX,
    moveY,
    walkIntoTileType,
    walkIntoTileIndex,
    animationiterator,
    direction,
    alive,
    invulnerable,
    invulnerablecounter,
    deathanimationcounter,
    maxhitpoints,
    currenthitpoints,
    damage,
    updatesreceived,
    updatessent,
    decidecounter,
    enemytype
  }
  return Object.assign(
    state,
    handleFacingTrait(state),
    decideFacingTrait(state),
    moveTrait(state),
    checkTilesTrait(state),
    flipTileTrait(state),
    takeDamageTrait(state),
    resetTrait(state),
    drawTrait(state),
    handleInvulnerableTrait(state),
    drawDeathAnimationTrait(state),
    initBatTrait(state)
  )
}

const initBansheeTrait = (state) => ({
  init: (id,x,y,hp) => {
    state.alive = true;
    state.myBitmap = bansheePic;
    if(id === 'localenemy') {
      state.myID = Math.random().toString(36).substr(2, 3);
    } else {
      state.myID = id;
    }
    state.reset(x,y); // Spawn point is hard coded for now to separate from Tile Map
    state.invulnerable = false;
    state.enemiesloadedlocally+= 1;    
    state.collisionbox = 10;
    state.animationiterator = 0;
    state.deathanimationcounter = 0;
    state.invulnerablecounter = 0;
    state.maxhitpoints = 180;
    state.currenthitpoints = 180;
    state.damage = 20;
    state.enemytype = "banshee";
    state.updatessent = 0;
    state.updatesreceived = 0;
    state.decidecounter = 0;
    state.direction = "down";
  }
})

const initBatTrait = (state) => ({
  init: (id,x,y,hp) => {
    state.alive = true;
    state.myBitmap = batPic;
    if(id === 'localenemy') {
      state.myID = Math.random().toString(36).substr(2, 3);
    } else {
      state.myID = id;
    }
    state.reset(x,y); // Spawn point is hard coded for now to separate from Tile Map
    state.invulnerable = false;
    state.enemiesloadedlocally+= 1;    
    state.collisionbox = 10;
    state.animationiterator = 0;
    state.deathanimationcounter = 0;
    state.invulnerablecounter = 0;
    state.maxhitpoints = 1;
    state.currenthitpoints = 1;
    state.damage = 2;
    state.enemytype = "bat";
    state.updatessent = 0;
    state.updatesreceived = 0;
    state.decidecounter = 0;
    state.direction = "down";
  }
})

const initSkeletonTrait = (state) => ({
  init: (id,x,y,hp) => {
    state.alive = true;
    state.myBitmap = skeletonPic;
    if(id === 'localenemy') {
      state.myID = Math.random().toString(36).substr(2, 3);
    } else {
      state.myID = id;
    } 
    state.reset(x,y); // Spawn point is hard coded for now to separate from Tile Map
    state.invulnerable = false;
    state.enemiesloadedlocally+= 1;    
    state.collisionbox = 10;
    state.animationiterator = 0;
    state.deathanimationcounter = 0;
    state.invulnerablecounter = 0;
    state.maxhitpoints = 12;
    state.currenthitpoints = 12;
    state.damage = 5;
    state.enemytype = "skeleton";
    state.updatessent = 0;
    state.updatesreceived = 0;
    state.decidecounter = 0;
    state.direction = "down";
  }
})

const resetTrait = (state) => ({
  reset: (x,y) => {
    state.speed = 0;
    state.homeX = x;
    state.homeY = y;
    state.x = x;
    state.y = y;
    state.gotoX = x;
    state.gotoY = y;      
  }
})

const drawDeathAnimationTrait = (state) => ({
  drawDeathAnimation: () => {
    if (state.deathanimationcounter > -1 && state.deathanimationcounter < 100) {
      canvasContext.drawImage(warriorDeathPic, 144,318, 32,32, state.x - 16, state.y - 5, 24,24);
    } else if (state.deathanimationcounter >= 100 && state.deathanimationcounter < 200) {
      canvasContext.drawImage(warriorDeathPic, 178,318, 32,32, state.x - 16, state.y - 5, 24,24);
    } else if (state.deathanimationcounter >= 200 && state.deathanimationcounter < 400) {
      canvasContext.drawImage(warriorDeathPic, 20,380, 64,96, state.x - 16, state.y - 24, 32,48);
    } else if (state.deathanimationcounter >= 400 && state.deathanimationcounter < 700) {
      canvasContext.drawImage(warriorDeathPic, 115,380, 64,96, state.x - 16, state.y - 24, 32,48);
    } else if (state.deathanimationcounter >= 700 && state.deathanimationcounter < 1100) {
      canvasContext.drawImage(warriorDeathPic, 212,295, 32,64, state.x - 14, state.y - 24, 24,48);
    } else if (state.deathanimationcounter >= 1100 && state.deathanimationcounter < 1600) {
      canvasContext.drawImage(warriorDeathPic, 244,290, 32,64, state.x - 14, state.y - 24, 24,48);
    } else if (state.deathanimationcounter >= 1600 && state.deathanimationcounter < 2200) {
      canvasContext.drawImage(warriorDeathPic, 276,290, 32,64, state.x - 14, state.y - 24, 24,48);
    } else if (state.deathanimationcounter >= 2200 && state.deathanimationcounter < 3000) {
      canvasContext.drawImage(warriorDeathPic, 308,290, 32,64, state.x - 14, state.y - 24, 24,48);
    }  else {
      // Empty so animation does nothing after final frame
    } // End of if then else
  }
})

const handleInvulnerableTrait = (state) => ({
  handleInvulnerable: () => {
    if (state.invulnerable === true) { // If character invulnerable
      if (state.invulnerablecounter > 100) { // And has been for 1000 clicks
        state.invulnerable = false; // Then they are no longer invulnerable
        state.invulnerablecounter = 0; // and the counter get reset
      } 
      state.invulnerablecounter+= 1; // iterate invulnerable counter
    }    
  }
})

const drawTrait = (state) => ({
  draw: () => {
    if (state.currenthitpoints <= 0) {  // Proof of Life Check
      state.alive = false;
    }
    if (state.alive === true) { // If character alive
      if(state.invulnerable === true) {  // If character invulnerable
        if (state.invulnerablecounter % 3 === 1) { // Flash bitmap
          drawCharacterSprite(state.myBitmap, state.x, state.y, 0, state.direction);
        }  else if (state.invulnerablecounter % 3 === 2) { // Flash bitmap
          drawCharacterSprite(state.myBitmap, state.x, state.y, 0, state.direction);
        } else {
          // Draw nothing for flash effect
        }      
      } else { // Timing of walk animation for character
        if (state.animationiterator > 750) {
          drawCharacterSprite(state.myBitmap, state.x, state.y, 0, state.direction);
        } else if (state.animationiterator > 500) {
          drawCharacterSprite(state.myBitmap, state.x, state.y, 1, state.direction);
        } else if (state.animationiterator > 250) {
          drawCharacterSprite(state.myBitmap, state.x, state.y, 2, state.direction);
        } else {
          drawCharacterSprite(state.myBitmap, state.x, state.y, 3, state.direction);
        }
      }
      if(state.animationiterator > 999) { // animation interator cycles to 1000 and resets under normal draw conditions
        state.animationiterator = 0;
      }
    } else {
      state.deathanimationcounter = state.deathanimationcounter + 5; // animation iterator simply goes upward after a character dies, so the animation concludes
      state.drawDeathAnimation(); // Draw explody death animation
    }
    state.handleInvulnerable();  
    if (state.alive && state.enemytype === undefined) {
      colorTextSmall(state.myName.toUpperCase(), state.x, state.y-25, "black"); // draw player name above image
    }
  }
})

const takeDamageTrait = (state) => ({
  takeDamage: (damageamount) => {
    if (state.invulnerable === false) {
      if (state.currenthitpoints > damageamount) {
        state.currenthitpoints = state.currenthitpoints - damageamount; // HP calculation
        state.invulnerable = true; // Set invulnerable
        state.invulnerablecounter = 0; // Set timer time until normal state
        state.current_xp = state.current_xp + 3;         
      } else {
        state.alive = false; // enemy dies
        state.currenthitpoints = state.currenthitpoints - damageamount; // HP calaculation
      }
    }  
  }
})

const moveTrait = (state) => ({
  move: () => {
    if(state.alive === true) { // if the character is alive
      state.deltaX = state.gotoX-state.x; // The delta is where we are going minus our position
      state.deltaY = state.gotoY-state.y; // for both x and y
      state.distToGo = Math.floor(Math.sqrt(state.deltaX*state.deltaX + state.deltaY*state.deltaY)); // square the cube of their product to get the distance to go
      state.moveX = Math.floor(UNIT_PIXELS_MOVE_RATE * state.deltaX/state.distToGo); // where we are moving to is the rate times the delta divided by the distance
      state.moveY = Math.floor(UNIT_PIXELS_MOVE_RATE * state.deltaY/state.distToGo); // for both
      if (state.walkIntoTileIndex != undefined) { // if we are going to run into an undefined
        state.walkIntoTileType = roomGrid[state.walkIntoTileIndex]; // fix that now
      }
      if(state.distToGo > UNIT_PIXELS_MOVE_RATE) { // if our distance to go is still above our move rate and our destination is one of the following:
        state.handleFacing();
        if(state.enemytype === undefined) {
          state.handleAttackBox();
          state.applyWeapon(state.weapon);
        }
        state.checkTiles();
      } else { // Our distance to go is less than our move rate
        // state.x = state.gotoX; // Just move there to avoid jittery stands that never resolve
        // state.y = state.gotoY;
        }
    } else {
      /// character is dead, so do nothing
    }          
  }
});

const flipTileTrait = (state) => ({
  flipTilesForItems: () => {
    if(localplayer.world === "global") {
      roomGrid[state.walkIntoTileIndex] = TILE_GROUND; // Flip the tile for a ground tile
    } else if (localplayer.world === "grove") {
      roomGrid[state.walkIntoTileIndex] = TILE_GROUND4; // Flip the tile for a ground tile
    } else if (localplayer.world === "ruin") {
      roomGrid[state.walkIntoTileIndex] = TILE_GROUND4; // Flip the tile for a ground tile
    }   
  }
});

const checkTilesTrait = (state) => ({
  checkTiles: () => {
    if(state.walkIntoTileType === TILE_WALL || state.walkIntoTileType === TILE_WALL2 || state.walkIntoTileType === TILE_WALL3 || state.walkIntoTileType === TILE_WALL4 || state.walkIntoTileType === TILE_WALL5 || state.walkIntoTileType === TILE_WALL6) { // If it"s a wall
      // Do Nothing at all 
    } else if (state.walkIntoTileType === TILE_GROUND) { // If it"s open ground
      state.animationiterator = state.animationiterator + 15; // cycle the animation iterator for this character
      state.x += state.moveX; // move to the next coord
      state.y += state.moveY;
    }else if (state.walkIntoTileType === TILE_GROUND2 || state.walkIntoTileType === TILE_GROUND3 || state.walkIntoTileType === TILE_GROUND4) { // If it"s open ground
      state.animationiterator = state.animationiterator + 15; // cycle the animation iterator for this character
      state.x += state.moveX; // move to the next coord
      state.y += state.moveY;
    } else if (state.walkIntoTileType === TILE_CHEST) { // If it"s a chest TODO: change effect/loot based on level of character
      if(state.enemytype === undefined) {
        state.changeWeapon();
      }       
      roomGrid[state.walkIntoTileIndex] = TILE_GROUND; // Flip the tile for a ground tile
    } else if (state.walkIntoTileType === TILE_DOOR) { // If it"s a door
      roomGrid[state.walkIntoTileIndex] = TILE_GROUND; // Flip the tile for a ground tile
    } else if (state.walkIntoTileType === TILE_BLUECUBE) { // If it"s a blue Cube
      state.takeDamage(1);
    } else if (state.walkIntoTileType === TILE_TURQUISECUBE) { // If it"s a turquoise Cube
      state.takeDamage(10);
    } else if (state.walkIntoTileType === TILE_GROVE_TOP) {
      if(state.current_xp !== undefined) { // Only the local player has XP
        sendSingleLeavePing();
        switchGrove("top"); 
      }      
    } else if (state.walkIntoTileType === TILE_RUIN_BOTTOM) {
      if(state.current_xp !== undefined) { // Only the local player has XP
        sendSingleLeavePing();
        switchRuin("bottom");        
      }      
    } else if (state.walkIntoTileType === TILE_GROVE_BOTTOM) {
      if(state.current_xp !== undefined) { // Only the local player has XP
        sendSingleLeavePing();
        switchGrove("bottom");  
      }      
    } else if (state.walkIntoTileType === TILE_GLOBAL) {
      if(state.current_xp !== undefined) { // Only the local player has XP
        sendSingleLeavePing();
        switchGlobal();
      }     
    } else if (state.walkIntoTileType === TILE_LONGSWORD) { // If it"s a LongSword
      if(state.enemytype === undefined) {
        state.weapon = "long sword";
        quickTipActive = true;
        quickTipString = "Using Long Sword";
        quickTipTime = 1;
      }                  
      state.flipTilesForItems();
    } else if (state.walkIntoTileType === TILE_SHORTSWORD) { // If it"s a Shortsword
      if(state.enemytype === undefined) {
        state.weapon = "short sword";
        quickTipActive = true;
        quickTipString = "Using Short Sword";
        quickTipTime = 1;   
      }                  
      state.flipTilesForItems();
    } else if (state.walkIntoTileType === TILE_SPEAR) { // If it"s a Spear
      if(state.enemytype === undefined) {
        state.weapon = "spear";
        quickTipActive = true;
        quickTipString = "Using Spear";
        quickTipTime = 1;
      }                  
      state.flipTilesForItems();
    } else if (state.walkIntoTileType === TILE_HEALPOTION) { // If it"s a +50HealingPotion
      if(state.enemytype === undefined) {
        state.currenthitpoints+= 50;
        if (state.currenthitpoints > state.maxhitpoints) {
          state.currenthitpoints = state.maxhitpoints;
        }
        quickTipActive = true;
        quickTipString = "+50 Hit Points";
        quickTipTime = 1;
      }                  
      state.flipTilesForItems();
    }
  }
});

const handleFacingTrait = (state) => ({
  handleFacing: () => {
    if (Math.abs(state.deltaY) >= Math.abs(state.deltaX) ) { // if the absolute of deltaY is > abs of deltaX(character is facing much more down/up than left/right)
      if(state.deltaY >= 0) { // if Delta y is above  0
        if(state.deltaX >= 0) {
          state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX + Math.floor(state.collisionbox/2),state.y + state.moveY + state.collisionbox);
        } else if (state.deltaX <= 0) {
          state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX - Math.floor(state.collisionbox/2),state.y + state.moveY + state.collisionbox);
        }
        state.direction = "down"; // then character is looking down   
        } else if (state.deltaY <= 0) { // if delta y is below 0
          if(state.deltaX >= 0) {
            state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX + Math.floor(state.collisionbox/2),state.y + state.moveY - state.collisionbox);
          } else if (state.deltaX <= 0) {
            state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX - Math.floor(state.collisionbox/2),state.y + state.moveY - state.collisionbox);
          }
        state.direction = "up"; // character is looking up
        }
      } else if (Math.abs(state.deltaY) <= Math.abs(state.deltaX) ) {
        if(state.deltaX >= 0) { // if Delta x is above  0
          if(state.deltaY >= 0) {
            state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX + Math.floor(state.collisionbox/2),state.y + state.moveY + state.collisionbox);
          } else if (state.deltaY <= 0) {
            state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX + Math.floor(state.collisionbox/2),state.y + state.moveY - state.collisionbox);
          }
        state.direction = "right"; // then character is looking right 
      } else if (state.deltaX <= 0) { // if delta x is below 0
        if(state.deltaY >= 0) {
          state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX - Math.floor(state.collisionbox/2),state.y + state.moveY + state.collisionbox);
        } else if (state.deltaY <= 0) {
          state.walkIntoTileIndex = getTileIndexAtPixelCoord(state.x + state.moveX - Math.floor(state.collisionbox/2),state.y + state.moveY - state.collisionbox);
        }
        state.direction = "left";  // character is looking left   
      }
    }
  }
});

const decideFacingTrait = (state) => ({
  decide: () => {
    if(Math.random() > 0.4) { // if we move at all in x plane
      if(Math.random() > 0.5) { // move random 50/50
        state.gotoX = state.x + 50;
      } else {
        state.gotoX = state.x - 50;
      }
    }
    if(Math.random() > 0.4) { // if we move at all in y plane
      if(Math.random() > 0.5) {// move random 50/50
        state.gotoY = state.y - 50;
      } else {
        state.gotoY = state.y + 50;
      }
    }
    state.decidecounter+= 1; // reset decide counter
    // sendAllEnemyUpdate(); // update network
  }
});

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
//---------------VARIABLES AND CONSTANTS--------
let iOS = "";
let imagesLoaded;
let picsloadedswitch = false;
let warriorPic = document.createElement("img");// Manual Overide for now --Create player array and loop through it
let menuTriggerPic = document.createElement("img");
let warriorDeathPic = document.createElement("img");
let paperPic = document.createElement("img");
let woodPic = document.createElement("img");
let tealGranitePic = document.createElement("img");
let princePic = document.createElement("img");
let knightPic = document.createElement("img");
let femaleknightPic = document.createElement("img");
let magePic = document.createElement("img");
let elffemalePic = document.createElement("img");
let elfmalePic = document.createElement("img");
let darkelffemalePic = document.createElement("img");
let darkelfmalePic = document.createElement("img");
let normalgirlPic = document.createElement("img");
let bardPic = document.createElement("img");
let batPic = document.createElement("img"); // ---- Images for sprites
let bansheePic = document.createElement("img"); // ---- Images for sprites
let skeletonPic = document.createElement("img"); // ---- Images for sprites
let badlandsPic = document.createElement("img"); // ---- Images for backgrounds
let icepalacePic = document.createElement("img"); // ---- Images for backgrounds
let imageArray = [
  {varName: warriorPic, fileName: "https://goo.gl/pNahFr"},
  {varName: menuTriggerPic, fileName: "https://goo.gl/bjxUVC"},
  {varName: warriorDeathPic, fileName: "https://goo.gl/456GW2"},
  {varName: paperPic, fileName: "https://goo.gl/eqcHxG"},
  {varName: woodPic, fileName: "https://goo.gl/dXFJmh"},
  {varName: tealGranitePic, fileName: "https://goo.gl/ktrDtM"},
  {varName: batPic, fileName: "https://goo.gl/WDiXbL"},
  {varName: skeletonPic, fileName: "https://goo.gl/wXgRUy"},
  {varName: princePic, fileName: "https://goo.gl/pNahFr"},
  {varName: knightPic, fileName: "https://goo.gl/cYzRv5"},
  {varName: femaleknightPic, fileName: "https://goo.gl/Pfjik2"},
  {varName: magePic, fileName: "https://goo.gl/zuzwJs"},
  {varName: elffemalePic, fileName: "https://goo.gl/mQ5sBr"},
  {varName: elfmalePic, fileName: "https://goo.gl/iEzPfK"},
  {varName: darkelfmalePic, fileName: "https://goo.gl/aRnRAJ"},
  {varName: darkelffemalePic, fileName: "https://goo.gl/9vEwrs"},
  {varName: normalgirlPic, fileName: "https://goo.gl/iHUnv5"},
  {varName: bardPic, fileName: "https://goo.gl/TKGhRe"},
  {varName: badlandsPic, fileName: "https://goo.gl/H6XVTP"},
  {varName: icepalacePic, fileName: "https://goo.gl/Bq4Ub8"},
  {varName: bansheePic, fileName: "https://goo.gl/85yiry"}
];

let debugisshowing = false;
let boxesareshowing = false;
let muteactive = false;
let showingDeleteConfirm = false;
let characterSaveTimer = 0;
let runningCharacterDelay = false;
let runningNameBoxDelay = false;
let nameBoxDelay = 0;
let justObserving = false;
let quickTipTime = 0;
let quickTipActive = false;
let quickTipString = '';
let useremail = ""; // Email address of user/player in the game
let userholder = {}; // Holder for the user object provided by rails/devise
let roomGrid = []; // Game world layout
const TILE_WIDTH = 32; // Width of the world tiles
const TILE_HEIGHT = 32; // Height of the world tiles
const UNIT_PIXELS_MOVE_RATE = 3; // Default move rate for entities
const ROOM_COLUMNS = 64; // Amount of columns in the game world
const ROOM_ROWS = 64; // Amount of rows in the game world
const TILE_GROUND = 0; // Integer values for roomgrid types:
const TILE_WALL = 1; // ---roomgrid types
const TILE_WALL2 = 9;
const TILE_PLAYER = 2;
const TILE_GROVE_BOTTOM = 3;
const TILE_CHEST = 4;
const TILE_DOOR = 5;
const TILE_BLUECUBE = 6;
const TILE_TURQUISECUBE = 7; // ---roomgrid types
const TILE_GROUND2 = 8;
const TILE_WALL3 = 10;
const TILE_GROUND3 = 11;
const TILE_GROUND4 = 12;
const TILE_WALL4 = 13;
const TILE_WALL5 = 14;
const TILE_WALL6 = 15; // ---roomgrid types
const TILE_GLOBAL = 16;
const TILE_SHORTSWORD = 17;
const TILE_LONGSWORD = 18;
const TILE_SPEAR = 19;
const TILE_HEALPOTION = 20;
const TILE_RUIN_BOTTOM = 21;
const TILE_GROVE_TOP = 22;
let consoleMousePos = "empty"; // holder for debug disply of MousePos
let consoleMousePosAfterScale = "empty"; // holder for debug display of mousepos after scalex/scaley
let consoleCamPan = "empty";// holder for debug display of camera offset
let camPanX = 0.0;// values for camera defaults to top left of screen
let camPanY = 0.0; // offset of y coord
let tilePics = []; // Array holding images for world tiles, numbered by type
let canvas; // Our primary canvas
let canvasContext; // Primary canvas context
let mapcanvas; // Our offscreen canvas for map
let mapcanvasContext; // context for map canvas
let playerArray = []; // Initial blank array to hold the instances of player(Warrior)
let enemyArray = []; // Initial blank array to hold the enemies
let localplayer = Character(); // Create instance of warrior for local player
let lastLocalPlayerPositionX = 0; // value for player position broadcast
let lastLocalPlayerPositionY = 0; // value for player position broadcast
let ratio = 1; // Ratio is set after a resize is called
let scalex = 1; // Modifier for scaled screensize x
let scaley = 1; // Modifier for scaled screensize y
let tileIndex = 0; // start at the very first tile
let tileLeftEdgeX = 0; // and at the left
let tileTopEdgeY = 0; // and top of that tile
let tileTypeHere = 0; // used during tile check in draw room
let eachRow = 0; // For looping through roomgrid
let eachColumn = 0; // For looping through roomgrid
let tileCol = 0; // For computing index
let tileRow = 0; // For computing index
let maxPanRight = 0; // For walls in camera follow
let maxPanTop = 0; // For walls in camera follow
let rect; // Get the size of the canvas
let root; // Get the document root from the DOM
let payload = []; // Array holder for network messages
let leadClient = true; // Whether this is the lead client or not
let pingcounter = 0; // ----------- timer for sending world pings
let worldAgeCounter = 0; // how long has the world been running?
let numberplayers = 0; // For move everything loop
let numberenemies = 0; // For move everything loop
let worldplayers = "Single Player Active"; // Default values for debug display
let hudMessage1 = "-";
let hudMessage2 = "-";
let hudMessage3 = "-";
let hudMessage4 = "-";
let hudMessage5 = "-";
let hudMessage6 = "-";
let hudMessage7 = "-";
let hudMessage8 = "-";
let hudMessage9 = "";
let hudMessage10 = "";
let worldupdatesaccepted = 0;
let worldupdatesdropped = 0;
let enemiesloadedfromnet = 0;
let enemiesloadedlocally = 0; // -----Default values for debug display
let fullscreen = false; // True/False value for if fullscreen is active in browser
let lobbyUrl = ".."; // hardcoded URL for lobby 
let mycharacters; // Gon watch variable for db list of current characters
let leavePingiterator = 0; // -------- Leave pings, ----X--X--Needs serious adjustment
let chatroomid = "1"; // For generating chatroom ID --Game Worldspace on network
let animationiterator = 0; // iterator for animating character and enemy sprites
let drawroomtileindex = 0; // index during draw loop for room tiles
let characterSelectScreenActive = true; // whether drawing the character select screen or not
let chosenCharacter; // which character is selected to be loaded from db for current game
let selectionColor = "grey"; // outline color for rows containing characters to be selected
let lifebarssize = 180; // default size of lifebar when maxxed out
let lifebarpercent = 100; // Starting percent of life bar
let menuscreenoffset = 0; // Amount to offset menu, half of CamPanX, and any other interface element when menu slides in
let menuactive = false; // flag for establishing whether the menu is considered active
let menudisplayed = "settings"; // which menu is up -- settings, character, or map
let reloadscreenactive = false; // flag for whether the reload screen is active
let reloadscreenhidden = false; // flag for whether the reload screen is hidden
let character = {}; // default character object
let characterSave = { // default message for network updates
  character:
    {
      name: "waaaat",
      character_class: "watt",
      current_xp: "10",
      gold: "100",
      id: "11"
    },
    commit: "Update Character"};
let characterCreate = { // default message for network updates
  character:
    {
      name: "waaaat",
      character_class: "watt",
      current_xp: "10",
      gold: "100",
    },
    commit: "Create Character"};
let mousePos; // Event Listener object that has .x and .y properties -- contains raw input from mouse before scaling
let cha = 0; // iterator for looping thru character array
let cameraOrigin = 0; // Tile that has been determined to be at top left of screen
let enemyupdatepingssent = 0; // Amount of update pings sent
let enemyupdatepingsgot = 0; // Amount of update pings received
let moveenemycounter = 0; // Iterator for how often to move enemies
let initialEnemiesSpawned = false // --x---x- REFACTOR if world age over 80 and in the lead ---- if initial enemies have spawned
let worldpingssent = 0; // Amount of world pings sent
let worldpingsgot = 0; // Amount of world pings got
let playerpingssent = 0; // Amount of player pings sent
let playerpingsgot = 0; // Amount of player pings got
let lastupdatedtimer = 0; // --x--x--x--Spread over several files, tracks since last updated from other lead client
let showingintro = true; // flag for whether we are showing the intro
let creditstext1 = "Programming and Story";
let creditstext2 = "Chris Scalf";
let creditstext3 = "Sprites";
let creditstext4 = "Sithjester";
let creditstext5 = "Ice-Ax";
let creditstext6 = "Enterbrain";
let creditstext7 = "Sebastion Bini";
let creditstext8 = "Hyptosis";
let creditstext9 = "Tilesets";
let creditstext10 = "Icons";
let creditstext11 = "Lamoot";
let creditstext12 = "Art Consultant";
let creditstext13 = "Arkieya Kelley";
let creditstext14 = "Play Testing";
let creditstext15 = "Callean Morris";
let creditstext16 = "Project Management/Soundtrack";
let intronametext = "LOYAL  ONLINE";
let intronametext2 = "Beta"
let logoxpos = 160;
let logoypos = 170;
let logoalpha = 1;
let introtime = 0;
let greyFadeRGBvalue = 0;
let backgroundZoomLevel = 1400;
let backgroundYPos = -400;
let backgroundXPos = -700;
let backgroundGlobalAlphaTime = 1;
let mapdrawn = false;
let selectedClass = 0;
let gameAgeCounter = 0;
let musicIsPlaying = false;
let showingCreateCharacter = false;
let classText1;
let classText2;
let classText3;
let classText4;
let curserBlinkTimer = 0;
let curserDrawOffset = 2;
let enterNameHasBeenClicked = false;
let nameBoxValue = "ENTER NAME";
let colbox = 0;
let attbox = []
let introTip1 = "Steady, if you look around";
let introTip1a = "it should only be bats around here";
let introTip2 = "That red box that moves with you?";
let introTip2a = "It's your attack radius";
let introTip3 = "You've just got a small dagger,";
let introTip3a = "but you can find something better";
let introTip4 = "And then find a way out of here."
let toolTipTimer = 0;
let menuBackgroundPosX = 0;
let menuBackgroundPosX2 = 256;
let range=makeRangeControl(20,80,160,25);
let range2=makeRangeControl(20,160,160,25);
let usingTouchScreen = false;
let mouseIsDown = false;
let mouseDownOnMapX = 0;
let isInMapArea = false;
let mapDisplayOriginX = 0;
let mapDisplayCurrentX = 0;
let selectKillActive = false;
let paperPicPos = 0;
let paperPicPos2 = 512;
let isInFirstSlider = false;
let isInSecondSlider = false;
let effectsgainvalue = 0.5;
let incomingenemyarray = [];
let globalChatActive = false; // Global map toggle
let groveChatActive = false; // Grove map toggle
let ruinChatActive = false; // Ruin map toggle
const weaponsoundURL = '/metallic-weapon-low.wav';  // Source of the sound to fetched
const lowhealthsoundURL = '/lowhealth.wav';  // Source of the sound to fetched
const enemyattacksoundURL = '/imp01.wav';  // Source of the sound to fetched
const playerdeathsoundURL = '/playerdeath.wav';
var AudioContext = window.AudioContext || window.webkitAudioContext;
const soundcontext = new AudioContext(); // Context, like canvasContext but for sound
let weaponsoundBuffer; // Create reference to hold sound
let lowhealthsoundBuffer; // Create reference to hold sound
let enemyattacksoundBuffer; // Create reference to hold sound
let playerdeathsoundBuffer;
let gainNode;
let paintBrushType = 0;
let editorActive = false;
let firstintrotext = "Whoever you were before all of this"; // Lines of Text for first Intro
let secondintrotext = "doesn't matter anymore";
let thirdintrotext = "The choices you make now";
let fourthintrottext = "are owned by only you";
let fifthintrotext = "But you're here now with the rest of us,";
let sixthintrotext = "So you must have been loyal to someone";
playerHasDied = false;



    mapcanvas = document.createElement('canvas');
    mapcanvas.width = ROOM_COLUMNS * 4;
    mapcanvas.height = ROOM_ROWS * 4;
    mapcanvasContext = mapcanvas.getContext("2d");

    canvas = document.getElementById("LoyalCanvas");
    canvas.height = 400;
    canvas.width = 400;
    canvasContext = canvas.getContext("2d");

    index_canvas = document.getElementById("indexCanvas");








//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Main Section
function drawGameQuickTips() {
  // Draw any Quick Tips   
  if (quickTipTime < 300 && quickTipActive) {
    canvasContext.globalAlpha = (300 - quickTipTime) / 200;
    drawQuickTip(quickTipString); 
  } else if (quickTipTime === 300) {
    quickTipActive = false;
    quickTipTime = 0; 
  } 
  if (quickTipActive) {
    quickTipTime+=1;
  }
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Intro Section
function ShowIntroAnimation() {
  let greyFadeRGB = "rgb(" + greyFadeRGBvalue + ", " + greyFadeRGBvalue + ", " + greyFadeRGBvalue + ")"; // Build text for RGB values
  if (introtime < 200) { // if introtime below 200
    colorTextCinzel(firstintrotext, 200,30, greyFadeRGB);   // First 2 lines of Intro
    colorTextCinzel(secondintrotext, 200,60, greyFadeRGB);
    greyFadeRGBvalue = greyFadeRGBvalue + 2; // fade to white
  } else if (introtime < 400) { // if the introtime is above 200 but below 400
    colorTextCinzel(firstintrotext, 200,30, greyFadeRGB);
    colorTextCinzel(secondintrotext, 200,60, greyFadeRGB);
    greyFadeRGBvalue = greyFadeRGBvalue - 2; // fade to black
  } else if (introtime < 600) {
    colorTextCinzel(thirdintrotext, 200,90, greyFadeRGB);     // 3 and 4th lines of Intro
    colorTextCinzel(fourthintrottext, 200,120, greyFadeRGB);
    greyFadeRGBvalue = greyFadeRGBvalue + 2; // fade to white
  } else if (introtime < 800) {
    colorTextCinzel(thirdintrotext, 200,90, greyFadeRGB);
    colorTextCinzel(fourthintrottext, 200,120, greyFadeRGB);
    greyFadeRGBvalue = greyFadeRGBvalue - 2; // fade to black
  } else if (introtime < 1000) { //--------------- if intro time above 800 but below 1000
    colorTextCinzel(fifthintrotext, 200,170, greyFadeRGB);     // 5th line of Intro
    greyFadeRGBvalue = greyFadeRGBvalue + 2; // fade to white
  } else if (introtime < 1200) { //--------------- if intro time above 1000 but below 1200
    colorTextCinzel(fifthintrotext, 200,170, greyFadeRGB);
    greyFadeRGBvalue = greyFadeRGBvalue - 2; // fade to black
  }else if (introtime < 1400) { //--------------- if the introtime is above 1200 but below 1400 --- Fade the last text
    colorTextCinzel(sixthintrotext, 200,240, greyFadeRGB); // 6th line of Intro
    greyFadeRGBvalue = greyFadeRGBvalue + 2; // fade to white
  } else if (introtime < 1600) { // if the introtime is above 1400 but below 1600
    colorTextCinzel(sixthintrotext, 200,240, greyFadeRGB);
    greyFadeRGBvalue = greyFadeRGBvalue - 2; // fade to black
  } else if (introtime < 2300) {  // ---------------if the intro time is above 1600 but less than 2300 --- Start fading in 1st background
    greyFadeRGBvalue = 0; // reset text value
    canvasContext.globalAlpha = backgroundGlobalAlphaTime / 400; // BGGA Time starts at one, so GA starts at 0.25 percent
    drawFirstBackground(); // Draw the actual image based on the inputs
    canvasContext.globalAlpha = 1; // Reset Alpha to Draw totally opaque
    if (backgroundGlobalAlphaTime < 401) { // As long as GA Time is still less than 401, (which = 100% opacity)
      backgroundGlobalAlphaTime+= 1; // Keep incrementing it up (until fully visible)
    }
    handleIntroBackgroundZoom(0.4,0.7);
  }  else if (introtime < 2600) { //--------------- if the intro time is above 2300 but less than 2600 --- Start fading out 1st background
    canvasContext.globalAlpha = backgroundGlobalAlphaTime / 400; // Background Alpha start at (400) (which = 100% opacity) and decrease
    drawFirstBackground(); // Draw actual background image
    canvasContext.globalAlpha = 1; // Reset the alphal back to full
    if (backgroundGlobalAlphaTime > 1) { // As long as the global alpha time is still above 1
        backgroundGlobalAlphaTime-= 1.5; // Decrease it by 1.5;
    }
    handleIntroBackgroundZoom(0.4,0.7);
  } else if (introtime < 2605) { // a few clock ticks above 2600 --- Reset our parameters for the 2nd background
    backgroundZoomLevel = 1600;  // Reset our levels
    backgroundYPos = -50;
    backgroundXPos = -300;
  } else if (introtime < 3500) { //--------------- if the intro time is above 2600 but less than 3500 --- Start fading in our 2nd background
    canvasContext.globalAlpha = backgroundGlobalAlphaTime / 400; // BGGA Time starts at one, so GA starts at 0.25 percent
    drawSecondBackground();
    canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
    if (backgroundGlobalAlphaTime < 401) { // if our opacity is less than full
        backgroundGlobalAlphaTime+= 1; // slowly increment it up
    }
    handleIntroBackgroundZoom(0.12,0.25);
  }  else if (introtime < 3800) { //--------------- if the intro time is above 3500 but less than 3900 --- Start fading out our 2nd background
    canvasContext.globalAlpha = backgroundGlobalAlphaTime / 400; // BGGA Time starts at one, so GA starts at 0.25 percent
    drawSecondBackground();  
    canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
    if (backgroundGlobalAlphaTime > 1) { // As long as the global alpha time is still above 1
        backgroundGlobalAlphaTime-= 1.5; // Decrease it by 1.5;
    }
    handleIntroBackgroundZoom(0.12,0.25);
  }
  else if (introtime < 4001) {
    // Nothing
  }else if (introtime > 4002) {
    showingintro = false;
  }
}

function handleIntroBackgroundZoom(yIncrement,xIncrement) {
  if (backgroundZoomLevel > 400) {
    backgroundZoomLevel-= 1;
  }
  if (backgroundYPos < 0) { // As long as y position is less than 0
    backgroundYPos+= yIncrement; // Increase it by 0.4
  }
  if (backgroundXPos < 0) { // As long as the x position is less 400
    backgroundXPos+= xIncrement; // increase it by .7
  }
}

function drawIntroButtons() {
  canvasContext.globalAlpha = 0.3; // BGGA Time starts at one, so GA starts at 0.25 percent
  colorRect(0, 370, 110, 30, "darkgrey"); // Fullscreen button
  colorTextCinzel("FULLSCREEN", 54, 390, "white");
  colorRect(310, 370, 90, 30, "darkgrey"); // Exit Realm button
  colorTextCinzel("SKIP", 354, 390, "white");
  canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
}

function drawIntroLogo() {
  if (introtime > 1650 && introtime < 1851) {
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzelHuge(intronametext, logoxpos,logoypos, "crimson");
    colorTextCinzel(intronametext2, logoxpos + 20, logoypos + 20, "cornflowerblue");
    logoxpos+= 0.2;
    logoypos+= 0.05;
    logoalpha+= 1;
    canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
  } else if (introtime > 1850 && introtime < 2050) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzelHuge(intronametext, logoxpos,logoypos, "crimson");
    colorTextCinzel(intronametext2, logoxpos + 20, logoypos + 20, "cornflowerblue");
    logoxpos+= 0.2;
    logoypos+= 0.05;
    if (logoalpha > 1) {
      logoalpha-= 1;
    } 
    canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
  }
}

function introCreditsFadeInTiming() {
  logoxpos+= 0.2;
  logoypos-= 0.05;
  logoalpha+= 1;
  canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
}

function introCreditsFadeOutTiming() {
  logoxpos+= 0.2;
  logoypos-= 0.05;
  if (logoalpha > 1) {
      logoalpha-= 1;
  }
  canvasContext.globalAlpha = 1; // Reset our drawing opacity to full
}

function drawIntroCredits() {
  if (introtime === 2051) {
    logoReset(120,280);
  }
  if (introtime > 2052 && introtime < 2201) {  // Programming and story by chris scalf
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext1, logoxpos,logoypos, "cornflowerblue");
    colorTextCinzel(creditstext2, logoxpos + 20, logoypos + 20, "white"); 
    introCreditsFadeInTiming();
  } else if (introtime > 2200 && introtime < 2350) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext1, logoxpos,logoypos, "cornflowerblue");
    colorTextCinzel(creditstext2, logoxpos + 20, logoypos + 20, "white");
    introCreditsFadeOutTiming();
  }
  if (introtime === 2351) {
    logoReset(300,130);
  }
  if (introtime > 2352 && introtime < 2501) { // Sprites by
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext3, logoxpos,logoypos, "cornflowerblue");
    colorTextCinzel(creditstext4, logoxpos + 20, logoypos + 20, "white");
    colorTextCinzel(creditstext5, logoxpos + 20, logoypos + 35, "white");
    colorTextCinzel(creditstext6, logoxpos + 20, logoypos + 50, "white");
    colorTextCinzel(creditstext7, logoxpos + 20, logoypos + 65, "white");
    colorTextCinzel(creditstext8, logoxpos + 20, logoypos + 80, "white");  
    introCreditsFadeInTiming();
  } else if (introtime > 2500 && introtime < 2650) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext3, logoxpos,logoypos, "cornflowerblue");
    colorTextCinzel(creditstext4, logoxpos + 20, logoypos + 20, "white");
    colorTextCinzel(creditstext5, logoxpos + 20, logoypos + 35, "white");
    colorTextCinzel(creditstext6, logoxpos + 20, logoypos + 50, "white");
    colorTextCinzel(creditstext7, logoxpos + 20, logoypos + 65, "white");
    colorTextCinzel(creditstext8, logoxpos + 20, logoypos + 80, "white");
    introCreditsFadeOutTiming();
  }
  if (introtime === 2651) {
    logoReset(300,280);
  }
  if (introtime > 2652 && introtime < 2801) { // Tilesets and icons by
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext9, logoxpos,logoypos, "cornflowerblue");
    colorTextCinzel(creditstext8, logoxpos + 20, logoypos + 20, "white");
    colorTextCinzel(creditstext10, logoxpos,logoypos + 50, "cornflowerblue");
    colorTextCinzel(creditstext11, logoxpos + 20, logoypos + 70, "white");   
    introCreditsFadeInTiming();
  } else if (introtime > 2800 && introtime < 2950) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext9, logoxpos,logoypos, "cornflowerblue");
    colorTextCinzel(creditstext8, logoxpos + 20, logoypos + 20, "white");
    colorTextCinzel(creditstext10, logoxpos,logoypos + 50, "cornflowerblue");
    colorTextCinzel(creditstext11, logoxpos + 20, logoypos + 70, "white");
    introCreditsFadeOutTiming();
  }
  if (introtime === 2951) {
    logoReset(120,130);
  }
  if (introtime > 2952 && introtime < 3101) { // Art Consultant Arkieya Kelley
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext12, logoxpos,logoypos, "pink");
    colorTextCinzel(creditstext13, logoxpos + 20, logoypos + 20, "white");
    introCreditsFadeInTiming();
  } else if (introtime > 3100 && introtime < 3250) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext12, logoxpos,logoypos, "pink");
    colorTextCinzel(creditstext13, logoxpos + 20, logoypos + 20, "white");
    introCreditsFadeOutTiming();
  }
  if (introtime === 3251) {
    logoReset(120,300);
  }
  if (introtime > 3252 && introtime < 3401) { // PlayTesting by the Bits
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext14, logoxpos,logoypos, "pink");
    colorTextCinzel(creditstext15, logoxpos + 20, logoypos + 20, "white"); 
    introCreditsFadeInTiming();
  } else if (introtime > 3400 && introtime < 3550) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext14, logoxpos,logoypos, "pink");
    colorTextCinzel(creditstext15, logoxpos + 20, logoypos + 20, "white");
    introCreditsFadeOutTiming();
  }
  if (introtime === 3551) {
    logoReset(220,130);
  }
  if (introtime > 3552 && introtime < 3701) { // Project Management Soundtrack Chris Scalf
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext16, logoxpos,logoypos, "pink");
    colorTextCinzel(creditstext2, logoxpos + 20, logoypos + 20, "white"); 
    introCreditsFadeInTiming();
  } else if (introtime > 3700 && introtime < 3850) { // if the introtime is above 200 but below 400
    canvasContext.globalAlpha = logoalpha / 100;
    colorTextCinzel(creditstext16, logoxpos,logoypos, "pink");
    colorTextCinzel(creditstext2, logoxpos + 20, logoypos + 20, "white");
    introCreditsFadeOutTiming();
  }
}

function logoReset(xpos,ypos) {
  logoxpos = xpos;
  logoypos = ypos;
}

function drawFirstBackground () {
  canvasContext.drawImage(badlandsPic, backgroundXPos, backgroundYPos,backgroundZoomLevel,backgroundZoomLevel); // Draw Draw background image
}

function drawSecondBackground () {
  canvasContext.drawImage(icepalacePic, backgroundXPos, backgroundYPos,backgroundZoomLevel,backgroundZoomLevel); // Draw Draw background image
}

function drawClassSelectInfo() {
  if(selectedClass === 0) {
    colorTextCinzelHuge("PRINCE", 150,140, "black");
  } else if (selectedClass === 1) {
    colorTextCinzelHuge("DARK ELF", 150,140, "black");
  } else if (selectedClass === 2) {
    colorTextCinzelHuge("MAGE", 150,140, "black");
  } else if (selectedClass === 3) {
    colorTextCinzelHuge("KNIGHT", 150,140, "black");
  } else if (selectedClass === 4) {
    colorTextCinzelHuge("ELF", 150,140, "black");
  }else if (selectedClass === 5) {
    colorTextCinzelHuge("BARD", 150,140, "black");
  } else if (selectedClass === 6) {
    colorTextCinzelHuge("RANGER", 150,140, "black");
  } else if (selectedClass === 7) {
    colorTextCinzelHuge("MODERN", 150,140, "black");
  } else if (selectedClass === 8) {
    colorTextCinzelHuge("DARK ELF", 150,140, "black");
  } else if (selectedClass === 9) {
    colorTextCinzelHuge("ELF", 150,140, "black");
  }
}

function showCreateCharacterScreen() {
  canvasContext.drawImage(paperPic, 0,0, 512,400, paperPicPos,0, 512,400);
  canvasContext.drawImage(paperPic, 0,0, 512,400, paperPicPos2,0, 512,400);
  paperPicPos-= 1;
  paperPicPos2-= 1;
  if (paperPicPos < -512) {
    paperPicPos = 512;
  }
  if (paperPicPos2 < -512) {
    paperPicPos2 = 512;
  }
  if(selectedClass === 0) { // Default Class is Prince
    drawCharacterSpriteForCreate(princePic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 1) { // Second Class is Dark Elf Female
    drawCharacterSpriteForCreate(darkelffemalePic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 2) { // Third Class is Mage
    drawCharacterSpriteForCreate(magePic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 3) { // Fourth Class is Knight
    drawCharacterSpriteForCreate(knightPic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 4) { // Fifth Class is Female Elf
    drawCharacterSpriteForCreate(elffemalePic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 5) { // sixth Class is Bard
    drawCharacterSpriteForCreate(bardPic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 6) { // 7th Class is FemaleKnight
    drawCharacterSpriteForCreate(femaleknightPic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 7) { // 7th Class is ModernGirl
    drawCharacterSpriteForCreate(normalgirlPic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 8) { // 7th Class is ModernGirl
    drawCharacterSpriteForCreate(darkelfmalePic, 270, 130, 0, "down"); // Frames can be 0-3
  } else if (selectedClass === 9) { // 7th Class is ModernGirl
    drawCharacterSpriteForCreate(elfmalePic, 270, 130, 0, "down"); // Frames can be 0-3
  } else {
    // Empty
  }
  drawClassSelectInfo();
  canvasContext.drawImage(menuTriggerPic, 378,258, 35,35, 10,300, 70,70);  // Previous Class
  canvasContext.drawImage(menuTriggerPic, 540,257, 35,35, 90,300, 70,70);  // Draw Draw Next Class 
  colorTextCinzelHuge("SELECT SPRITE", 150,30, "black");

  canvasContext.globalAlpha = 0.6;
  colorRect(0, 370, 110, 30, "darkgrey"); // Fullscreen button
  colorRect(210,370, 240,30, "blue");
  colorRect(180,50, 220,30, "blue");
  canvasContext.globalAlpha = 1;

  colorTextCinzel("CREATE CHARACTER", 304,390, "white");
  colorTextCinzel("FULLSCREEN", 54, 390, "white");
  if(!enterNameHasBeenClicked){
    colorTextCinzel("ENTER NAME", 290,70, "white"); //----<<<< Add condition for enterNameHasBeenClicked
  }
  colorTextCinzel("Mouse: " + consoleMousePos, 150, 280, "lightgrey");
  colorTextCinzel("Adjusted: " + consoleMousePosAfterScale, 150, 300, "lightgrey");
  nameBoxValue = document.getElementById('namebox').value;
  if (curserBlinkTimer === 20) {
    curserBlinkTimer = 0;
  } else if (curserBlinkTimer < 10 && enterNameHasBeenClicked) {
    nameBoxValue = nameBoxValue + "|";
    curserDrawOffset = 2;
  } else {
    curserDrawOffset = 0;
  }
  curserBlinkTimer+=1;
  colorTextCinzel(nameBoxValue, 291 + curserDrawOffset,70, "white");
  if (runningNameBoxDelay) {
    runNameBoxDelay();
  }
}





    let showingSplash = true;

    loadLoyalImages();// Deceptive -- The Set Interval is set from here--Should rename



    canvasContext.textAlign = "center";








function playLoyal(timestamp){ // Loaded into a requestAnimationFrame and is responsible for directing the game
  requestAnimationFrame(playLoyal); // call requestAnimationFrame again to animate next frame
  if(showingintro) {
    loyalIntro();  // Play Loyal Intro Sequence    
  }
  else if(characterSelectScreenActive) {
    showCharacterSelect();
    // checkForMobileMac(); // Check for iOS to disable touchmove on gamemap until better optimized
  } else if(showingCreateCharacter) {
    showCreateCharacterScreen();
  } else {
    if(editorActive) {
      colorRect(0, 0, 400, 400, "black"); // clear the screen
      drawEditorDisplay();
    } else { 
      loyalGamePlay(); // Normal gameplay
    }         
  }
  resize(); // Check for window size/orientation change
}// End of playLoyal


function loyalIntro() {
  if(charactersholder.length < 1) {
    colorRect(0, 0, 400, 400, "black"); // clear the screen
    introtime+= 1;
    ShowIntroAnimation();
    drawIntroLogo();
    drawIntroCredits();
    drawIntroButtons();
  } else {
    showingintro = false;
    characterSelectScreenActive = true;
  }
}


function loyalGamePlay() {
  // playBackgroundMusic();
  drawEverything();
  moveEverything();
  sendPlayerMovement();
  if(playerArray.length < 1) {
    drawReloadCounter();
    leadClient = true;
  } else {
    reloadscreenactive = false; // should keep players from auto refreshing at loss of connection, and only bring up reload button
  }
  if(!localplayer.alive && !justObserving) {
    if (!playerHasDied) {
      playDeathSound();
      playerHasDied = true;
    }
    
    drawPlayerDeathMenu();
  }
  handleWorldAgeAndPings();
}




function moveNetworkPlayers() {
  if(playerArray.length > 0) {
    for(numberplayers = 0; numberplayers < playerArray.length; numberplayers+= 1) {
      playerArray[numberplayers].move(); // Add For loop and Player Array
      if(playerArray[numberplayers] !== undefined) {
        playerArray[numberplayers].lastSeenIncrement();
        if (playerArray[numberplayers].sinceLastSeen > 1500 ) {       
          playerArray.splice([numberplayers], 1); // Remove player from Array because of network timeout
        }
      }      
    }
  }
}

function moveEverything() { // handles movement of active entities in world
  moveNetworkPlayers();   
  handleEnemySpawnTiming();
  decideEnemies();
  localplayer.move();   
  checkEnemyCollision();
  moveEnemies();
  enemyGarbageCollect();
  handleLowHealth();
}

function handleLowHealth() {
  if(localplayer.alive) { // if the player is alive
    if ((localplayer.currenthitpoints < (Math.floor(localplayer.maxhitpoints / 5)) && localplayer.currenthitpoints > -1) && (animationiterator === 5 || animationiterator === 400 || animationiterator === 600 || animationiterator === 200)) { // but is very low on health
      playLifeLow();  // play low health warning sound
    }
  }
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Editor Section
function drawEditorDisplay() {
  tileTopEdgeY = 0; // We do the same for Y but increments of tile height -- needed here
  drawroomtileindex = 0; // variable to increment for nested loop -- It's where we are in the roomGrid and must be reset here
  for (eachRow = 0; eachRow < ROOM_ROWS; eachRow+= 1) { // For each row (Starting at the left and going right)
    tileLeftEdgeX = 0; // This sets the Left edge at the far left of the tile -- For beginning a new row and gets incremented at end of loop
    for (eachColumn = 0; eachColumn < ROOM_COLUMNS; eachColumn+= 1) { // For each column (Starting at the top going down)
      tileCheckForDrawEditor();         
      drawroomtileindex+= 1;
      tileLeftEdgeX += 6; // incrementor for next column -- screen positioner
    }   // end of column scan
    tileTopEdgeY += 6; // incremtentor for next row -- screen positioner
  }   // end of row scan
  // colorTextCinzel("Mouse: " + consoleMousePos, 150, 330, "black");
  // colorTextCinzel("Adjusted: " + consoleMousePosAfterScale, 150, 350, "black");
  canvasContext.drawImage(tilePics[0], 384, 192, 32,32, 0,384, 16,16); // Draw ground
  canvasContext.drawImage(tilePics[8], 32, 652, 32,32, 16, 384, 16,16); // Draw ground2
  canvasContext.drawImage(tilePics[11], 224, 192, 32,32, 32, 384, 16,16); // Draw ground3
  canvasContext.drawImage(tilePics[12], 672, 96, 32,32, 48, 384, 16,16); // Draw ground4
  canvasContext.drawImage(tilePics[1], 512, 96, 32,32, 64, 384, 16,16); // Draw wall
  canvasContext.drawImage(tilePics[9], 96, 112, 32,32, 80, 384, 16,16); // Draw wall2
  canvasContext.drawImage(tilePics[10], 385, 320, 31,32, 96, 384, 16,16); // Draw wall3
  canvasContext.drawImage(tilePics[13], 864, 224, 31,32, 112, 384, 16,16); // Draw wall4
  canvasContext.drawImage(tilePics[14], 736, 416, 31,32, 128, 384, 16,16); // Draw wall5
  canvasContext.drawImage(tilePics[15], 768, 416, 31,32, 144, 384, 16,16); // Draw wall6
  canvasContext.drawImage(tilePics[4], 432,672, 16,16, 160, 384, 16,16); // Draw chest
  canvasContext.drawImage(tilePics[5], 256, 926, 32,32, 176, 384, 16,16); // Draw door
  canvasContext.drawImage(tilePics[6], 566,382, 126,110, 192, 384, 16,16); // Draw blue cube
  canvasContext.drawImage(tilePics[7], 736,20, 124,126, 208, 384, 16,16); // Draw turqoise cube
} // End of Draw Editor Display

function editorInput() {
  var mouseBrickCol = Math.floor((mouseX/scalex) / 6); // Round values to save processor cycles
  var mouseBrickRow = Math.floor((mouseY/scaley) / 6); // When computing scale(From resize function) of cursor position
  var brickIndexUnderMouse = rowColToArrayIndex(mouseBrickCol, mouseBrickRow); // brickIndexUnderMouse is true if Index is matched
  if(brickIndexUnderMouse >= 0 && brickIndexUnderMouse < ROOM_COLUMNS * ROOM_ROWS) { // And if so
   roomGrid[brickIndexUnderMouse] = paintBrushType; // Mark that square to be edited
  }
  if (isScaledMouseOverBox(0,16,383,400)) {
    paintBrushType = 0;
  } else if (isScaledMouseOverBox(15,32,383,400)) {
    paintBrushType = 8;
  } else if (isScaledMouseOverBox(31,48,383,400)) {      
    paintBrushType = 11;
  } else if (isScaledMouseOverBox(47,64,383,400)) {       
    paintBrushType = 12;
  } else if (isScaledMouseOverBox(63,80,383,400)) {       
    paintBrushType = 1;
  } else if (isScaledMouseOverBox(79,96,383,400)) {        
    paintBrushType = 9;
  } else if (isScaledMouseOverBox(95,112,383,400)) {       
    paintBrushType = 10;
  } else if (isScaledMouseOverBox(111,128,383,400)) {       
    paintBrushType = 13;
  } else if (isScaledMouseOverBox(127,144,383,400)) {     
    paintBrushType = 14;
  } else if (isScaledMouseOverBox(143,160,383,400)) {       
    paintBrushType = 15;
  } else if (isScaledMouseOverBox(159,176,383,400)) {   
    paintBrushType = 4;
  }else if (isScaledMouseOverBox(175,192,383,400)) {   
    paintBrushType = 5;
  } else if (isScaledMouseOverBox(192,208,383,400)) {        
    paintBrushType = 6;
  } else if (isScaledMouseOverBox(207,224,383,400)) {       
    paintBrushType = 7;
  }
}

function tileCheckForDrawEditor() { // Determin which tile to draw in draw room
  tileTypeHere = roomGrid[drawroomtileindex]; // Figure out what type of tile to draw 
  if (tileTypeHere === TILE_GROUND) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "LightSlateGray") // Draw ground
  } else if (tileTypeHere === TILE_GROUND2) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "purple"); // Draw ground
  } else if (tileTypeHere === TILE_GROUND3) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "grey"); // Draw ground
  } else if (tileTypeHere === TILE_GROUND4) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "lightgreen"); // Draw ground
  } else if (tileTypeHere === TILE_WALL) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "DarkSlateGray") // Draw wall
  } else if (tileTypeHere === TILE_WALL2) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "LightSalmon") // Draw wall2
  } else if (tileTypeHere === TILE_WALL3) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "SaddleBrown") // Draw wall2
  } else if (tileTypeHere === TILE_WALL4) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "Tomato") // Draw wall2
  } else if (tileTypeHere === TILE_WALL5) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "DarkGray") // Draw wall2
  } else if (tileTypeHere === TILE_WALL6) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "DarkGray") // Draw wall2
  } else if (tileTypeHere === TILE_CHEST) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "Yellow") // Draw wall2
  } else if (tileTypeHere === TILE_DOOR) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "Brown") // Draw Door
  } else if (tileTypeHere === TILE_BLUECUBE) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "blue") // Draw blue cube
  } else if (tileTypeHere === TILE_TURQUISECUBE) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "Turquoise") // Draw wall2
  } else if (tileTypeHere === TILE_SHORTSWORD) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  } else if (tileTypeHere === TILE_LONGSWORD) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  } else if (tileTypeHere === TILE_SPEAR) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  } else if (tileTypeHere === TILE_HEALPOTION) {
    colorRect(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  }   
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Enemy Management Section
function enemyGarbageCollect() { // Remove dead enemies from array after death animation
  for (eachenemy = 0; eachenemy < enemyArray.length; eachenemy++) {
    if (enemyArray[eachenemy].alive === false && enemyArray[eachenemy].deathanimationcounter > 3000) {
      enemyArray.splice(eachenemy,1);
    }
  }
}

function checkEnemyCollision() {
  for(eachenemy = 0; eachenemy < enemyArray.length; eachenemy++) { // for each enemy in the array
    if (localplayer.alive) {
      if (localplayer.sincelastattack > localplayer.weaponspeed) {  
        if ( !(localplayer.attackbox[0] > enemyArray[eachenemy].x + enemyArray[eachenemy].collisionbox || 
        localplayer.attackbox[0] + localplayer.attackbox[2] < enemyArray[eachenemy].x - enemyArray[eachenemy].collisionbox || 
        localplayer.attackbox[1] > enemyArray[eachenemy].y + enemyArray[eachenemy].collisionbox || 
        localplayer.attackbox[1] + localplayer.attackbox[3] < enemyArray[eachenemy].y - enemyArray[eachenemy].collisionbox) ) 
        {
          if (enemyArray[eachenemy].currenthitpoints > -1) { // If the enemy is still alive
            enemyArray[eachenemy].takeDamage(localplayer.damage);// Do damage to the enemy
            //---------iOS sound work
            playWeaponSound();
            localplayer.current_xp+= localplayer.damage;
            localplayer.xp_since_starting+= localplayer.damage;
            sendAllEnemyUpdate();
            localplayer.sincelastattack = 0;
            if (localplayer.xp_since_starting > Math.floor(localplayer.current_xp / 20) && localplayer.xp_since_starting > 100) { // Save character based on level advancement
              saveCharacter();
              localplayer.xp_since_starting = 0;
            }
          }                  
        }
      } 
    }
    if(enemyArray[eachenemy].alive) {// compare my x and y with the x and y of the iterator from enemy array, and calc damage if approps
      if ( !(localplayer.x - localplayer.collisionbox > enemyArray[eachenemy].x + enemyArray[eachenemy].collisionbox || 
        localplayer.x + localplayer.collisionbox < enemyArray[eachenemy].x - enemyArray[eachenemy].collisionbox || 
        localplayer.y - localplayer.collisionbox > enemyArray[eachenemy].y + enemyArray[eachenemy].collisionbox || 
        localplayer.y + localplayer.collisionbox < enemyArray[eachenemy].y - enemyArray[eachenemy].collisionbox) ) 
      {
        localplayer.takeDamage(enemyArray[eachenemy].damage);

        if (!playerWasHit && localplayer.alive) {
          playerWasHit = true;
          playEnemyAttack();
          setTimeout(playerHitReset, 1000);
        }
      }
    }         
  }
  localplayer.sincelastattack+= 1;
}

let playerWasHit = false;

function playerHitReset() {
  playerWasHit = false;
}


function decideEnemies() { // Handle enemy movement decisions if client is in lead
  if (moveenemycounter === 300) {
    if (leadClient) {
      for (eachenemy = 0; eachenemy < enemyArray.length; eachenemy++) {
        enemyArray[eachenemy].decide();
      }
    }
    moveenemycounter = 0;
  }
  moveenemycounter+= 1;
}

function spawnEnemies() {
  if(localplayer.world === "global") {
    spawnInitialEnemies();
  } else if (localplayer.world === "grove") {
    spawnGroveEnemies();
  }
}

function moveEnemies() {
  for(numberenemies = 0; numberenemies < enemyArray.length; numberenemies+= 1) {
    enemyArray[numberenemies].move(); // Add For loop and Player Array
    enemyArray[numberenemies].animationiterator = enemyArray[numberenemies].animationiterator + 8;
  }
}

function handleEnemySpawnTiming() {
  if(leadClient && worldAgeCounter > 80 && !initialEnemiesSpawned) { // if world age is >80 and not updated from net
    spawnEnemies();
    initialEnemiesSpawned = true;
  }
  if (pingcounter === 5 && leadClient && worldAgeCounter > 500) {
    spawnEnemies();
  }
}

function spawnInitialEnemies() {
  if(enemyArray.length < 40) {
    spawnEnemyBat(100,100);
    // spawnEnemyBanshee(100,100)
    spawnEnemyBat(245,620);
    spawnEnemyBat(150,1620);
    spawnEnemyBat(1450,1500);
    spawnEnemyBat(1800,800);
    spawnEnemyBat(750,700);

    spawnEnemySkeleton(410,330);
    spawnEnemySkeleton(1600,330);
    spawnEnemySkeleton(1800, 1800);

    sendAllEnemyUpdate();
  }
}

function spawnGroveEnemies() {
  if(enemyArray.length < 40) {
    spawnEnemyBat(100,100);
    
    spawnEnemyBat(265,640);
    spawnEnemyBat(200,1620);
    spawnEnemyBat(1450,1500);
    spawnEnemyBat(1700,800);
    spawnEnemyBat(750,700);

    spawnEnemySkeleton(410,330);
    spawnEnemySkeleton(1600,330);
    spawnEnemySkeleton(1800, 1800);
    spawnEnemyBanshee(100,150)

    sendAllEnemyUpdate();
  }
}

function spawnEnemyBanshee(xpos,ypos) {
  if(enemyArray.length < 40) {
    let localenemy = EnemyBanshee('localenemy',xpos,ypos);  // create new instance of composited object bat
    localenemy.init('localenemy',xpos,ypos,180); // init the new enemy with ID and place in world              
    enemyArray.push(localenemy); // push the new enemy into the array 
  }
}

function spawnEnemyBat(xpos,ypos) {
  if(enemyArray.length < 40) {
    let localenemy = EnemyBat('localenemy',xpos,ypos);  // create new instance of composited object bat
    localenemy.init('localenemy',xpos,ypos,1); // init the new enemy with ID and place in world           
    enemyArray.push(localenemy); // push the new enemy into the array 
  }
}

function spawnEnemySkeleton(xpos,ypos) {
  if(enemyArray.length < 40) {
    let localenemy = EnemySkeleton('localenemy',xpos,ypos);  // create new instance of class for enemy
    localenemy.init('localenemy', xpos,ypos, 12); // init the new enemy with ID and place in world         
    enemyArray.push(localenemy); // push the new enemy into the array 
  }
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Database API Section
function saveCharacter() { // Saves character to DB to update stats
  character.name = localplayer.myName;
  character.character_class = localplayer.character_class;
  character.current_xp = localplayer.current_xp;
  character.gold = localplayer.gold;
  character.id = localplayer.id;
  character.world = localplayer.world;
  character.weapon = localplayer.weapon;
  characterSave.character = character;
  characterSave.commit = "Update Character";
  $.ajax({
  type: "PATCH", 
  url: "/characters/" + characterSave.character.id,
  data: characterSave
  });
}

function deleteCharacter() {
  character.id = chosenCharacter.id;
  characterSave.character = character;
  characterSave.commit = "Delete Character";
  $.ajax({
  type: "DELETE", 
  url: "/characters/" + character.id,
  data: characterSave
  });
}

function createCharacter() { // Saves character to DB to update stats
  character.name = document.getElementById('namebox').value;
  if(selectedClass === 0) {
    character.character_class = 'prince';
    character.sprite = 'prince';
  } else if (selectedClass === 1) {
    character.character_class = 'darkelffemale';
    character.sprite = 'darkelffemale';
  }else if (selectedClass === 2) {
    character.character_class = 'mage';
    character.sprite = 'mage';
  }else if (selectedClass === 3) {
    character.character_class = 'knight';
    character.sprite = 'knight';
  }else if (selectedClass === 4) {
    character.character_class = 'elffemale';
    character.sprite = 'elffemale';
  }else if (selectedClass === 5) {
    character.character_class = 'bard';
    character.sprite = 'bard';
  }else if (selectedClass === 6) {
    character.character_class = 'femaleknight';
    character.sprite = 'femaleknight';
  }else if (selectedClass === 7) {
    character.character_class = 'normalgirl';
    character.sprite = 'normalgirl';
  }else if (selectedClass === 8) {
    character.character_class = 'darkelfmale';
    character.sprite = 'darkelfmale';
  }else if (selectedClass === 9) {
    character.character_class = 'elfmale';
    character.sprite = 'elfmale';
  }
  character.current_xp = 0;
  character.gold = 0;
  character.world = "global";
  character.weapon = "dagger";
  characterCreate.character = character;
  characterCreate.commit = "Create Character";
  $.ajax({
  type: "POST", 
  url: "/characters",
  data: characterCreate
  });
}

//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
// -+-+-+//-+-+-+//-+-+// Audio Section
// function sound(src) {
//   this.sound = document.createElement("audio");
//   this.sound.src = src;
//   this.sound.setAttribute("preload", "auto");
//   this.sound.setAttribute("controls", "none");
//   this.sound.style.display = "none";
//   document.body.appendChild(this.sound);
//   this.play = function(){
//     this.sound.play();
//   }
//   this.stop = function(){
//     this.sound.pause();
//   }
// }

window.fetch(weaponsoundURL) // Fetch acutal source of sound
  .then(response => response.arrayBuffer()) // Get response
  .then(arrayBuffer => soundcontext.decodeAudioData(arrayBuffer, () => {})) // Then decode response
  .then(audioBuffer => { // set reference to decoded response
  weaponsoundBuffer = audioBuffer;
});

window.fetch(lowhealthsoundURL) // Fetch acutal source of sound
  .then(response => response.arrayBuffer()) // Get response
  .then(arrayBuffer => soundcontext.decodeAudioData(arrayBuffer, () => {})) // Then decode response
  .then(audioBuffer => { // set reference to decoded response
  lowhealthsoundBuffer = audioBuffer;
});

window.fetch(enemyattacksoundURL) // Fetch acutal source of sound
  .then(response => response.arrayBuffer()) // Get response
  .then(arrayBuffer => soundcontext.decodeAudioData(arrayBuffer, () => {})) // Then decode response
  .then(audioBuffer => { // set reference to decoded response
  enemyattacksoundBuffer = audioBuffer;
});

window.fetch(playerdeathsoundURL) // Fetch acutal source of sound
  .then(response => response.arrayBuffer()) // Get response
  .then(arrayBuffer => soundcontext.decodeAudioData(arrayBuffer, () => {})) // Then decode response
  .then(audioBuffer => { // set reference to decoded response
  playerdeathsoundBuffer = audioBuffer;
});

// function playBackgroundMusic() {
//     if(!musicIsPlaying) {
//         introMusic.stop();
//         firstLevelMusic.play();
//         // firstLevelMusic.volume = 0.5;
//         musicIsPlaying = true;
//     }      
// }

function play(audioBuffer) { // Function to play audio from web api
  if (!soundcontext.createGain) {
    soundcontext.createGain = soundcontext.createGainNode;
  }
  gainNode = soundcontext.createGain();
  gainNode.gain.value = effectsgainvalue;
  const source = soundcontext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(gainNode);
  gainNode.connect(soundcontext.destination);    
  source.start();
}

// ------------iPhone sound workaround----------------


var usingIOS = false;

var AudioContext = window.AudioContext || window.webkitAudioContext; // Declare AudioContext var for browsers compatability

var locked = true;  // For determining whether to suspend/resume based on focus

var errored = false; // Tracks when to return out of any functions because of browser error


var requestTing = new XMLHttpRequest(); // set requestBoom var to shorten XML
requestTing.open('GET', '/metallic-weapon-low.wav', true); // XML requestBoom for file 
requestTing.responseType = 'arraybuffer'; // Set response type

var requestBoom = new XMLHttpRequest(); // set requestBoom var to shorten XML
requestBoom.open('GET', '/playerdeath.wav', true); // XML requestBoom for file 
requestBoom.responseType = 'arraybuffer'; // Set response type

var requestLifeLow = new XMLHttpRequest(); // set requestLifeLow var to shorten XML
requestLifeLow.open('GET', '/lowhealth.wav', true); // XML requestLifeLow for file 
requestLifeLow.responseType = 'arraybuffer'; // Set response type

var requestEnemyAttack = new XMLHttpRequest(); // set requestEnemyAttack var to shorten XML
requestEnemyAttack.open('GET', '/imp01.wav', true); // XML requestEnemyAttack for file 
requestEnemyAttack.responseType = 'arraybuffer'; // Set response type

function playDeathSound() {
  if (usingIOS && os !== 'Mac OS') {
    console.log("playDeathSound- play for IOS")
    playForIOS(requestBoom.response);
  } else {
    console.log("playDeathSound- play all others")
    play(playerdeathsoundBuffer);
  }
}

function playWeaponSound() {
  if (usingIOS && os !== 'Mac OS') {
    console.log("playWeaponSound- play for IOS")
    playForIOS(requestTing.response);
  } else {
    console.log("playWeaponSound- play all others")
    play(weaponsoundBuffer);
  }
}

function playLifeLow() {
  if (usingIOS && os !== 'Mac OS') {
    console.log("playLifeLow- play for IOS")
    playForIOS(requestLifeLow.response);
  } else {
    console.log("playLifeLow- play all others")
    play(lowhealthsoundBuffer);
  }
}

function playEnemyAttack() {
  if (usingIOS && os !== 'Mac OS') {
    console.log("EnemyAttack- play for IOS")
    playForIOS(requestEnemyAttack.response);
  } else {
    console.log("EnemyAttack- play all others")
    play(enemyattacksoundBuffer);
  }
}
//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
//---------------DRAW CODE--------
//----------------XXXXXXXX_______________----------------------XXXXXXXXX--------
function drawRoom() {   
  tileTopEdgeY = 0; // Reset our column marker
  cameraOrigin = getTileIndexAtPixelCoord(camPanX, camPanY); // Determine tile at top left corner of screen
  drawroomtileindex = 0; // Reset our Room Tile Index
  // top left col and row visible
  let cameraLeftMostCol = Math.floor(camPanX / TILE_WIDTH);
  let cameraTopMostRow = Math.floor(camPanY / TILE_HEIGHT);
  // rows and cols that fit on camera
  let colsOnScreen = Math.floor(canvas.width / TILE_WIDTH);
  let rowsOnScreen = Math.floor(canvas.height / TILE_HEIGHT);
  // measure right and bottom edges with a buffer for overlap
  let cameraRightMostCol = cameraLeftMostCol + colsOnScreen + 1;
  let cameraBottomMostRow = cameraTopMostRow + rowsOnScreen + 1;
  for (eachRow = 0; eachRow < ROOM_ROWS; eachRow+= 1) { // For each row (Starting at the left and going right)
  tileLeftEdgeX = 0; // Reset our row marker
    for (eachColumn = 0; eachColumn < ROOM_COLUMNS; eachColumn+= 1) { // For each column (Starting at the top going down)      
      if (eachRow < cameraTopMostRow || eachRow > cameraBottomMostRow || eachColumn < cameraLeftMostCol || eachColumn > cameraRightMostCol) { // Needs Refactor later to fit more room sizes
        // Do jack
      } else {
        tileCheckForDrawRoom();  // If tilte fits within viewing area box, draw the tile
      }   
      drawroomtileindex+= 1;
      tileLeftEdgeX += TILE_WIDTH; // incrementor for next column -- screen positioner
    }   // end of column scan
    tileTopEdgeY += TILE_HEIGHT; // incrementor for next row -- screen positioner
  }   // end of row scan
} // End of Draw Room

function drawCharacterSprite(image,x,y,frame,direction) { // draw animated character sprite
  if (direction === "down") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,0, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,0, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,0, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,0, 32,48, x - 12, y - 18, 24,36); 
    }
  } else if (direction === "up") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,144, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,144, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,144, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,144, 32,48, x - 12, y - 18, 24,36); 
    }
  } else if (direction === "right") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,96, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,96, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,96, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,96, 32,48, x - 12, y - 18, 24,36); 
    }
  } else if (direction === "left") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,48, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,48, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,48, 32,48, x - 12, y - 18, 24,36);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,48, 32,48, x - 12, y - 18, 24,36); 
    }
  }
}

function drawCharacterSpriteForCreate(image,x,y,frame,direction) { // draw animated character sprite
  if (direction === "down") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,0, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,0, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,0, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,0, 32,48, x - 12, y - 18, 96,144); 
    }
  } else if (direction === "up") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,144, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,144, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,144, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,144, 32,48, x - 12, y - 18, 96,144); 
    }
  } else if (direction === "right") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,96, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,96, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,96, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,96, 32,48, x - 12, y - 18, 96,144); 
    }
  } else if (direction === "left") {
    if (frame === 0) {
      canvasContext.drawImage(image, 0,48, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 1) {
      canvasContext.drawImage(image, 32,48, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 2) {
      canvasContext.drawImage(image, 64,48, 32,48, x - 12, y - 18, 96,144);
    } else if (frame === 3) {
      canvasContext.drawImage(image, 96,48, 32,48, x - 12, y - 18, 96,144); 
    }
  }
}

function drawIntroTips() {
  if(localplayer.current_xp > 80 || localplayer.world !== "global" || localplayer.weapon !== "dagger") {return;}

  if (gameAgeCounter > 100 && gameAgeCounter < 500) {
    // Draw Tooltip Near player
    drawToolTip(introTip1, localplayer.x, localplayer.y + 50, toolTipTimer/100);
    drawToolTip(introTip1a, localplayer.x, localplayer.y + 65, toolTipTimer/100);  
  }
  if (gameAgeCounter > 100 && gameAgeCounter < 300) {
    toolTipTimer+=1;
  } else if (gameAgeCounter > 300 && gameAgeCounter < 500) {
    toolTipTimer-=1;
  }
  if (gameAgeCounter > 700 && gameAgeCounter < 1100) {
    drawToolTip(introTip2, localplayer.x, localplayer.y + 50, toolTipTimer/100); // Draw Tooltip Near player
    drawToolTip(introTip2a, localplayer.x, localplayer.y + 65, toolTipTimer/100); 
  }
  if (gameAgeCounter > 700 && gameAgeCounter < 900) {
    toolTipTimer+=1;
  } else if (gameAgeCounter > 900 && gameAgeCounter < 1100) {
    toolTipTimer-=1;
  }
  if (gameAgeCounter > 1300 && gameAgeCounter < 1700) {
    drawToolTip(introTip3, localplayer.x, localplayer.y + 50, toolTipTimer/100); // Draw Tooltip Near player
    drawToolTip(introTip3a, localplayer.x, localplayer.y + 65, toolTipTimer/100);  
  }
  if (gameAgeCounter > 1300 && gameAgeCounter < 1500) {
    toolTipTimer+=1;
  } else if (gameAgeCounter > 1500 && gameAgeCounter < 1700) {
    toolTipTimer-=1;
  }
  if (gameAgeCounter > 1900 && gameAgeCounter < 2300) {
    // Draw Tooltip Near player
    drawToolTip(introTip4, localplayer.x, localplayer.y + 65, toolTipTimer/100);  
  }
  if (gameAgeCounter > 1900 && gameAgeCounter < 2100) {
    toolTipTimer+=1;
  } else if (gameAgeCounter > 2100 && gameAgeCounter < 2300) {
    toolTipTimer-=1;
  }
}

function drawToolTip(text,x,y,alpha) {
  canvasContext.globalAlpha = alpha;
  colorTextCinzel(text, x, y, "white");
  canvasContext.globalAlpha = 1;
}

function drawQuickTip(text) {
  colorTextCinzel(text, localplayer.x, localplayer.y - 53, "white");
  canvasContext.globalAlpha = 1;
}

function drawCollisionBoxes() {
  if(boxesareshowing) {
    for (let allplayers = 0; allplayers < playerArray.length; allplayers++) {
      colbox = playerArray[allplayers].collisionbox;
      colorRectOutline(playerArray[allplayers].x - colbox, playerArray[allplayers].y - colbox, (colbox * 2), (colbox * 2), "yellow" );
    }
    colbox = localplayer.collisionbox;
    colorRectOutline(localplayer.x - colbox, localplayer.y - colbox, (colbox * 2), (colbox * 2), "yellow" );
    for (let allenemies = 0; allenemies < enemyArray.length; allenemies+= 1) {
      colbox = enemyArray[allenemies].collisionbox;
      colorRectOutline(enemyArray[allenemies].x - colbox, enemyArray[allenemies].y - colbox, (colbox * 2), (colbox * 2), "yellow" );
    }
  }
  attbox = localplayer.attackbox;
  if (localplayer.alive) {
    if (localplayer.sincelastattack > localplayer.weaponspeed) {        
      colorRectOutline(attbox[0], attbox[1], attbox[2], attbox[3], "red");
      colorRectOutline(attbox[0] + 1, attbox[1] + 1, attbox[2] - 2, attbox[3] - 2, "red");
    } else {
      colorRectOutline(attbox[0], attbox[1], attbox[2], attbox[3], "blue");
      colorRectOutline(attbox[0] + 1, attbox[1] + 1, attbox[2] - 2, attbox[3] - 2, "blue");
    }
  }
}

function drawEverything() { // Handles rendering at highest level and acts as drawing switchboard
  
  // this next line is like subtracting camPanX and camPanY from every
  // canvasContext draw operation up until we call canvasContext.restore
  // this way we can just draw them at their "actual" position coords

  canvasContext.save(); // needed to undo this .translate() used for scroll

  canvasContext.translate(-camPanX+(menuscreenoffset/2),-camPanY); // Adjust play area for menu

  drawRoom(); // Draw the part of Room Grid that fits on screen
  drawNetworkPlayers();
  localplayer.draw(); // Draw local player
  drawCollisionBoxes();
  drawIntroTips();
  drawGameQuickTips();
  drawAllEnemies();
  canvasContext.restore(); // Do this after the restore so it will scroll with the player

  drawMenuSlide();
  drawMenuButton();
  drawMenuArea();
  cameraFollow();

  if(!mapdrawn) { // If minimap hasn't been drawn refresh it
    drawMapDisplay();
    mapdrawn = true;
  }
  checkIfLeftPage();
  colorRectForMap(localplayer.x / 8, localplayer.y / 8, 1, 1, 'white');// Update player positon on minimap
}

function drawAllEnemies() {
  for(numberenemies = 0; numberenemies < enemyArray.length; numberenemies+= 1) {
    enemyArray[numberenemies].draw(); // Draw all players in the playerArray
  }
}

function drawNetworkPlayers() {
  for(numberplayers = 0; numberplayers < playerArray.length; numberplayers+= 1) {
    playerArray[numberplayers].handleFacing(); // control display of networked characters
    playerArray[numberplayers].draw(); // Draw all players in the playerArray
  }
}

function drawMenuSlide() { 
  if(menuactive) { // If the menu is active
    menuscreenoffset = menuscreenoffset + 5; // iterate up on the offset
    if (menuscreenoffset > 200) { // but if it goes above 200
      menuscreenoffset = 200; // set it back to 200
    }
    drawLifeBar();
    if (debugisshowing) {
      colorTextSmallShadow("Mouse: " + consoleMousePos, 90+menuscreenoffset, 20, "green", "white");
      colorTextSmallShadow("Adjusted: " + consoleMousePosAfterScale, 90+menuscreenoffset, 30, "blue", "white");
      colorTextSmallShadow("Camera Origin: " + consoleCamPan, 90+menuscreenoffset, 40, "black", "white");
      colorTextSmallShadow(worldplayers, 90+menuscreenoffset, 50, "green", "white");
      colorTextSmallShadow("World Age: " + worldAgeCounter, 90+menuscreenoffset, 60, "purple", "white");
    }
    scrollingHud();        
  } else {
    menuscreenoffset = menuscreenoffset - 5; // else we iterate down on the offset
    if (menuscreenoffset < 0) { // but if it goes below 0
      menuscreenoffset = 0; // set it back to 0
    }
    drawLifeBar();
    if (debugisshowing) {
      colorTextSmallShadow("Mouse: " + consoleMousePos, 90+menuscreenoffset, 20, "green", "white");
      colorTextSmallShadow("Adjusted: " + consoleMousePosAfterScale, 90+menuscreenoffset, 30, "blue", "white");
      colorTextSmallShadow("Camera Origin: " + consoleCamPan, 90+menuscreenoffset, 40, "black", "white");
      colorTextSmallShadow(worldplayers, 90+menuscreenoffset, 50, "green", "white");
      colorTextSmallShadow("World Age: " + worldAgeCounter, 90+menuscreenoffset, 60, "purple", "white");
    }        
    scrollingHud();
  }
}

function drawLifeBar() { // Draws and updates lifebar based on percentage of hit points compared to maximum
  if(localplayer.alive) {
    canvasContext.globalAlpha = 0.5;
    colorRect(10+menuscreenoffset, 10, 180, 10, "pink");
    lifebarpercent = localplayer.currenthitpoints / localplayer.maxhitpoints;
    lifebarssize = Math.floor(180 * lifebarpercent);
    if(lifebarssize < 0) {
      lifebarssize = 0;
    }
    colorRect(10+menuscreenoffset, 10, lifebarssize, 10, "red");
    canvasContext.globalAlpha = 1;
  }    
}

function drawMenuButton() { // Draw menu button above world and position correctly with sliding behavior
  if(localplayer.alive) {
    if (!menuactive) { // if menu not active
      canvasContext.drawImage(menuTriggerPic, 378,258, 35,35, 2+menuscreenoffset,350, 35,35);  // Draw menu trigger image standard
    } else {
      canvasContext.drawImage(menuTriggerPic, 378,258, 35,35, 2+menuscreenoffset,350, 35,35); // Draw menu trigger moved
    }  
  } else {
    menuactive = false;
  }       
}

function drawMenuArea() { // Draw the actual menu that slides to fill half the screen
  if(menuactive || menuscreenoffset > 0) { // If the menu is active or in the act of sliding
    if(menudisplayed === "settings") {
      drawSettingsMenu();
    } else if (menudisplayed === "map") {
      drawMapMenu();
    } else if (menudisplayed === "character") {
      drawCharacterMenu();
    } 
  } 
}

function drawSettingsMenuBackground() {
  if(menuBackgroundPosX < menuBackgroundPosX2) {
    canvasContext.drawImage(paperPic,menuBackgroundPosX,0,200,400,menuscreenoffset-200,0,200,400); // draw PosX first
    canvasContext.drawImage(paperPic,menuBackgroundPosX2,0,200,400,menuscreenoffset-200,0,200,400);
  } else {
    canvasContext.drawImage(paperPic,menuBackgroundPosX2,0,200,400,menuscreenoffset-200,0,200,400); // draw PosX2 first
    canvasContext.drawImage(paperPic,menuBackgroundPosX,0,200,400,menuscreenoffset-200,0,200,400);
  }

  if (menuBackgroundPosX > 512) {
    menuBackgroundPosX = 0;
  }

  menuBackgroundPosX+=0.5;
  if (menuBackgroundPosX2 > 512) {
    menuBackgroundPosX2 = 0;
  }
  menuBackgroundPosX2+=0.5;
}

function drawSettingsMenu() {
  drawSettingsMenuBackground();

  canvasContext.globalAlpha = 0.6;

  // colorRect(menuscreenoffset-190, 65, 180, 30, "grey"); // First Slider Area  // Music disabled until refactor
  colorRect(menuscreenoffset-190, 145, 180, 30, "grey"); // Second Slider Area
  colorRect(menuscreenoffset-90, 270, 90, 30, "white"); // Mute button
  colorRect(menuscreenoffset-200, 320, 110, 30, "green"); // Show Hitboxes button
  colorRect(menuscreenoffset-90, 320, 90, 30, "white"); // Debug button
  colorRect(menuscreenoffset-200, 370, 110, 30, "blue"); // Fullscreen button
  colorRect(menuscreenoffset-90, 370, 90, 30, "black"); // Exit Realm button

  canvasContext.globalAlpha = 1;

  colorTextCinzel("MUTE", menuscreenoffset-48, 290, "black");
  colorTextCinzel("SHOW BOX", menuscreenoffset-145, 340, "yellow");
  colorTextCinzel("DEBUG", menuscreenoffset-48, 340, "black");
  colorTextCinzel("FULLSCREEN", menuscreenoffset-145, 390, "black");
  colorTextCinzel("QUIT", menuscreenoffset-48, 390, "white");

  canvasContext.drawImage(tealGranitePic,0,0,100,30,menuscreenoffset-200,0,100,30);
  colorTextCinzel("CHARACTER", menuscreenoffset-151, 19, "black");

  canvasContext.drawImage(woodPic,0,0,100,30,menuscreenoffset-100,0,100,30);
  colorTextCinzel("MAP", menuscreenoffset-50, 19, "black");

  // colorTextCinzel("Music volume", menuscreenoffset-100, 55, "black");  // Music disabled until refactor
  colorTextCinzel("Effects volume", menuscreenoffset-100, 135, "black");

  // drawRangeControl(range);  // Music disabled until refactor
  drawRangeControl(range2);
}

function drawRangeControl(range){
  // bar
  canvasContext.lineWidth=6;
  canvasContext.lineCap='round';
  canvasContext.beginPath();
  canvasContext.moveTo(menuscreenoffset - range.x,range.y);
  canvasContext.lineTo(menuscreenoffset - range.x1,range.y);
  canvasContext.strokeStyle='black';
  canvasContext.stroke();
  // thumb
  canvasContext.beginPath();
  var thumbX = (menuscreenoffset - range.x+range.width*range.pct) - range.width;//---------
  canvasContext.moveTo(thumbX,range.y-range.height/2);
  canvasContext.lineTo(thumbX,range.y+range.height/2);
  canvasContext.strokeStyle='rgba(255,0,0,0.25)';
  canvasContext.stroke();
  // legend
  canvasContext.fillStyle='blue';
  canvasContext.textAlign='center';
  canvasContext.textBaseline='top';
  canvasContext.font='10px arial';
  canvasContext.fillText(parseInt(range.pct*100)+'%',menuscreenoffset - (range.x+range.width/2),range.y-range.height/2-2);
  // Reset textBaseline
  canvasContext.textBaseline='alphabetic';
  canvasContext.lineWidth=1;
}

function drawMapDisplay() {
  tileTopEdgeY = 0; // We do the same for Y but increments of tile height -- needed here
  drawroomtileindex = 0; // variable to increment for nested loop -- It's where we are in the roomGrid and must be reset here
  for (eachRow = 0; eachRow < ROOM_ROWS; eachRow+= 1) { // For each row (Starting at the left and going right)
    tileLeftEdgeX = 0; // This sets the Left edge at the far left of the tile -- For beginning a new row and gets incremented at end of loop
    for (eachColumn = 0; eachColumn < ROOM_COLUMNS; eachColumn+= 1) { // For each column (Starting at the top going down)
      tileCheckForDrawMap();  
      drawroomtileindex+= 1;
      tileLeftEdgeX += 4; // incrementor for next column -- screen positioner
    }   // end of column scan
    tileTopEdgeY += 4; // incrementor for next row -- screen positioner
  }   // end of row scan
} // End of Draw Map Display

function drawMapCanvasToScreen(x,y) {
  canvasContext.drawImage(mapcanvas,mapDisplayCurrentX,0,180,256,x,y,180,260); // Source width and height need reduced for Safari
}

// image, source x, source y, swidth, sheight, x position, y position, width, height



// JavaScript syntax:  context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
// Parameter Values
// Parameter Description Play it
// img Specifies the image, canvas, or video element to use   
// sx  Optional. The x coordinate where to start clipping  
// sy  Optional. The y coordinate where to start clipping  
// swidth  Optional. The width of the clipped image  
// sheight Optional. The height of the clipped image 
// x The x coordinate where to place the image on the canvas 
// y The y coordinate where to place the image on the canvas 
// width Optional. The width of the image to use (stretch or reduce the image) 
// height  Optional. The height of the image to use (stretch or reduce the image)



function handleMapDrag() {
  if(!menuactive || menudisplayed != "map"){return;}

  if (isScaledMouseOverBox(10,190,50,310)) {
    isInMapArea = true;
  } else {
    isInMapArea = false;
  }
  if ((mouseIsDown || usingTouchScreen) && isInMapArea) {
    mouseDownOnMapX = (mousePos.x/scalex); // Handle mouse drag to move map
    mapDisplayCurrentX = mapDisplayOriginX - mouseDownOnMapX + 100;
    if (mapDisplayCurrentX < 0) {
      mapDisplayCurrentX = 0;
    } else if (mapDisplayCurrentX > 75) {
      mapDisplayCurrentX = 75;
    }
  }
}

function drawMapMenuBackground() {
  if(menuBackgroundPosX < menuBackgroundPosX2) {
    canvasContext.drawImage(woodPic,menuBackgroundPosX,0,200,400,menuscreenoffset-200,0,200,400); // draw PosX first
    canvasContext.drawImage(woodPic,menuBackgroundPosX2,0,200,400,menuscreenoffset-200,0,200,400);
  } else {
    canvasContext.drawImage(woodPic,menuBackgroundPosX2,0,200,400,menuscreenoffset-200,0,200,400); // draw PosX2 Second
    canvasContext.drawImage(woodPic,menuBackgroundPosX,0,200,400,menuscreenoffset-200,0,200,400);
  }
  if (menuBackgroundPosX > 512) {
    menuBackgroundPosX = 0;
  }
  menuBackgroundPosX+=0.5;
  if (menuBackgroundPosX2 > 512) {
    menuBackgroundPosX2 = 0;
  }
  menuBackgroundPosX2+=0.5;
}

function drawMapMenu() {
  drawMapMenuBackground();
  drawMapCanvasToScreen(menuscreenoffset-190,50);

  canvasContext.drawImage(tealGranitePic,0,0,100,30,menuscreenoffset-200,0,100,30);
  colorTextCinzel("CHARACTER", menuscreenoffset-151, 19, "black");

  canvasContext.drawImage(paperPic,0,0,100,30,menuscreenoffset-100,0,100,30);
  colorTextCinzel("SETTINGS", menuscreenoffset-50, 19, "black");

  canvasContext.globalAlpha = 0.6;
  colorRect(menuscreenoffset-200, 360, 130, 30, "blue"); // Fullscreen button
  canvasContext.globalAlpha = 1;
  colorTextCinzel("CLEAR HISTORY", menuscreenoffset-135, 380, "white");
  colorTextCinzel("DRAG MAP TO SCROLL", menuscreenoffset-100, 330, "white");
}

function drawCharacterMenuBackground() {
  if(menuBackgroundPosX < menuBackgroundPosX2) {
    // draw PosX first
    canvasContext.drawImage(tealGranitePic,menuBackgroundPosX,0,200,400,menuscreenoffset-200,0,200,400);
    canvasContext.drawImage(tealGranitePic,menuBackgroundPosX2,0,200,400,menuscreenoffset-200,0,200,400);
  } else {
    // draw PosX2 first
    canvasContext.drawImage(tealGranitePic,menuBackgroundPosX2,0,200,400,menuscreenoffset-200,0,200,400);
    canvasContext.drawImage(tealGranitePic,menuBackgroundPosX,0,200,400,menuscreenoffset-200,0,200,400);
  }
  if (menuBackgroundPosX > 750) {
    menuBackgroundPosX = 0;
  }
  menuBackgroundPosX+=0.5;
  if (menuBackgroundPosX2 > 750) {
    menuBackgroundPosX2 = 0;
  }
  menuBackgroundPosX2+=0.5;
}

function drawCharacterMenu() {
  drawCharacterMenuBackground();

  canvasContext.drawImage(paperPic,0,0,100,30,menuscreenoffset-200,0,100,30);
  colorTextCinzel("SETTINGS", menuscreenoffset-151, 19, "black");

  canvasContext.drawImage(woodPic,0,0,100,30,menuscreenoffset-100,0,100,30);
  colorTextCinzel("MAP", menuscreenoffset-50, 19, "black");

  colorTextCinzel("Name: " + localplayer.myName, menuscreenoffset-107, 70, "black");

  if (localplayer.current_xp > 2000 && localplayer.current_xp < 4000) {
    colorTextCinzel("Level: 2", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 4000 && localplayer.current_xp < 8000) {
    colorTextCinzel("Level: 3", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 8000 && localplayer.current_xp < 18000) {
    colorTextCinzel("Level: 4", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 18000 && localplayer.current_xp < 35000) {
    colorTextCinzel("Level: 5", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 35000 && localplayer.current_xp < 70000) {
    colorTextCinzel("Level: 6", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 70000 && localplayer.current_xp < 125000) {
    colorTextCinzel("Level: 7", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 125000 && localplayer.current_xp < 250000) {
    colorTextCinzel("Level: 8", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 250000 && localplayer.current_xp < 500000) {
    colorTextCinzel("Level: 9", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 500000 && localplayer.current_xp < 750000) {
    colorTextCinzel("Level: 10", menuscreenoffset-110, 99, "black");
  } else if (localplayer.current_xp > 750000 && localplayer.current_xp < 1000000) {
    colorTextCinzel("Level: 11", menuscreenoffset-110, 99, "black");
  } else {
    colorTextCinzel("Level: 1", menuscreenoffset-110, 99, "black");
  }

  if (localplayer.currenthitpoints > 0) {
    colorTextCinzel("HP: " + localplayer.currenthitpoints + " (Max: " + localplayer.maxhitpoints + ")", menuscreenoffset-99, 130, "black");
  } else {
    colorTextCinzel("HP: " + localplayer.currenthitpoints + " (Max: " + localplayer.maxhitpoints + ")", menuscreenoffset-99, 130, "red");
  }
    
  colorTextCinzel("XP: " + localplayer.current_xp, menuscreenoffset-99, 150, "black");
  colorTextCinzel("Weapon: " + localplayer.weapon, menuscreenoffset-99, 170, "black");
  colorTextCinzel("Damage: " + localplayer.damage, menuscreenoffset-99, 190, "black");
  colorTextCinzel("Weapon Speed: " + localplayer.weaponspeed, menuscreenoffset-99, 210, "black");
}

function scrollingHud() { // Debug HUD for development
  if (debugisshowing) {
    if(menuactive) {
      hudMessage1 = getTileIndexAtPixelCoord(camPanX,camPanY);
      colorTextSmall("Top left corner at tile: " + hudMessage1, 290, 70, "black", "white");
      hudMessage2 = animationiterator;
      colorTextSmall("anim iterator: " + hudMessage2, 290, 80, "black", "white");
      hudMessage3 = localplayer.direction;
      colorTextSmall(hudMessage3, 290, 90, "black", "white");
      colorTextSmall(hudMessage4, 290, 100, "black", "white");
      colorTextSmall(hudMessage5, 290, 110, "black", "white");
      colorTextSmall(hudMessage6, 290, 120, "black", "white");
    } else {
      hudMessage1 = getTileIndexAtPixelCoord(camPanX,camPanY);
      colorTextSmall("TopLeftCornerAtTile: " + hudMessage1, 90, 70, "green", "white");
      hudMessage2 = animationiterator;
      colorTextSmall("AnimIterator: " + hudMessage2, 90, 80, "blue", "white");
      hudMessage3 = localplayer.direction;
      colorTextSmall("PlayerDirection: " + hudMessage3, 90, 90, "black", "white");
      hudMessage4 = leadClient;
      if (leadClient) {
        colorTextSmallShadow("DM Lead: " + hudMessage4 + " " + lastupdatedtimer, 90, 100, "black", "green");
      } else {
        colorTextSmallShadow("DM Lead: " + hudMessage4 + " " + lastupdatedtimer, 90, 100, "black", "red");
      }        
      hudMessage5 = enemyArray.length;
      colorTextSmall("# of enemies: " + hudMessage5, 90, 110, "green", "white");
      hudMessage6 = "PlayerPing Snt/Rc: " + playerpingssent + "/" + playerpingsgot;
      colorTextSmall(hudMessage6, 90, 120, "blue", "white");
      hudMessage7 = "WorldPing Snt/Rc: " + worldpingssent + "/" + worldpingsgot;
      colorTextSmall(hudMessage7, 90, 130, "black", "white");
      hudMessage8 = "EnemyPing Snt/Rc: " + enemyupdatepingssent + "/" + enemyupdatepingsgot;
      colorTextSmall(hudMessage8, 90, 140, "green", "white");
      hudMessage9 = "WorldUpdates Accepted/Dropped: " + worldupdatesaccepted + "/" + worldupdatesdropped;
      colorTextSmall(hudMessage9, 90, 150, "blue", "white");
      hudMessage10 = "EnemiesLoaded Local/Net: " + enemiesloadedlocally + "/" + enemiesloadedfromnet;
      colorTextSmall(hudMessage10, 90, 160, "black", "white");
      for (let enem = 0; enem < enemyArray.length; enem+= 1) { // Display enemy array
        colorTextSmall( ("x" + enemyArray[enem].x + "-y" + enemyArray[enem].y + "-" + enemyArray[enem].myID + " S" + enemyArray[enem].updatessent + "-R" + enemyArray[enem].updatesreceived + "+D" + enemyArray[enem].decidecounter ) , 300,10 + (15 * enem), "black", "white");
      }
    }
  }    
}

function showCharacterSelect() { // Handles high level character select and draws options from DB characters listing
  drawCharacterSelectScreen();
  resize();
  colorTextCinzel("Name", 100,60, "black");
  colorTextCinzel("XP", 340,60, "black");
  for (cha = 0; cha < charactersholder.length; cha+= 1) {
    canvasContext.globalAlpha = 0.6;
    colorRect(0, 80 + (60 * cha), 400, 45, selectionColor);
    canvasContext.globalAlpha = 1;
    colorTextCinzel(charactersholder[cha].name, 100,107 + (60 * cha), "black");
    // colorTextCinzel(charactersholder[cha].character_class, 160,60 + (60 * cha), "black");
    colorTextCinzel(charactersholder[cha].current_xp, 340,107 + (60 * cha), "black");
    // colorTextCinzel(charactersholder[cha].gold, 360,60 + (60 * cha), "black");
  }
  if (showingDeleteConfirm) {
    showDeleteCharacterConfirmation();
  }
}

function drawCharacterSelectButtons() {
  canvasContext.globalAlpha = 0.6;
  if(charactersholder.length < 4) {
    colorRect(240,360, 160,40, "blue");
    colorTextCinzelHuge("CREATE", 320,389, "white");
  }
  if(charactersholder.length > 3) {
    colorRect(130,360, 120,40, "red");
    colorTextCinzelHuge("KILL", 180,389, "white");
  }
  colorRect(0, 370, 110, 30, "darkgrey"); // Fullscreen button
  colorTextCinzel("FULLSCREEN", 54, 390, "white");
  canvasContext.globalAlpha = 1;
}

function drawCharacterSelectScreenBackground() {
  canvasContext.drawImage(paperPic, 0,0, 512,400, paperPicPos,0, 512,400);
  canvasContext.drawImage(paperPic, 0,0, 512,400, paperPicPos2,0, 512,400);
  paperPicPos-= 1;
  paperPicPos2-= 1;
  if (paperPicPos < -512) {
    paperPicPos = 512;
  }
  if (paperPicPos2 < -512) {
    paperPicPos2 = 512;
  }
}

function drawCharacterSelectScreen() { // Draw static character select screen elements
  drawCharacterSelectScreenBackground();
  if (selectKillActive) {
    colorTextCinzelHuge("KILL WHOM?", 190,30, "black");
  } else {
    colorTextCinzelHuge("SELECT CHARACTER", 190,30, "black");
  }
  drawCharacterSelectButtons();
  // colorTextCinzel("Mouse: " + consoleMousePos, 150, 330, "black");
  // colorTextCinzel("Adjusted: " + consoleMousePosAfterScale, 150, 350, "black");  
}

function drawReloadCounter() { // Debug mini menu for when other players are not detected
  if(localplayer.alive) {
    reloadscreenactive = true;
    if(!reloadscreenhidden) {
      colorRect(290,0, 110,20, "blue"); 
      colorTextSmall("No players detected", 345,10, "Black");
      colorRect(350,13, 50,10, "grey"); 
      colorRect(290,13, 60,10, "green"); 
      colorTextSmall("Reload Now", 320,22, "Black");
      colorTextSmall("Hide This", 375,22, "Black");
    }
  }  
}

function tileCheckForDrawMap() { // Determin which tile to draw in draw room
  tileTypeHere = roomGrid[drawroomtileindex]; // Figure out what type of tile to draw  
  if (tileTypeHere === TILE_GROUND) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "LightSlateGray") // Draw ground
  } else if (tileTypeHere === TILE_GROUND2) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "purple"); // Draw ground
  } else if (tileTypeHere === TILE_GROUND3) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "grey"); // Draw ground
  } else if (tileTypeHere === TILE_GROUND4) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "lightgreen"); // Draw ground
  } else if (tileTypeHere === TILE_WALL) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "DarkSlateGray") // Draw wall
  } else if (tileTypeHere === TILE_WALL2) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "LightSalmon") // Draw wall2
  } else if (tileTypeHere === TILE_WALL3) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "SaddleBrown") // Draw wall2
  } else if (tileTypeHere === TILE_WALL4) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "Tomato") // Draw wall2
  } else if (tileTypeHere === TILE_WALL5) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "DarkGray") // Draw wall2
  } else if (tileTypeHere === TILE_WALL6) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "DarkGray") // Draw wall2
  } else if (tileTypeHere === TILE_CHEST) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "Yellow") // Draw wall2
  } else if (tileTypeHere === TILE_DOOR) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "Brown") // Draw Door
  } else if (tileTypeHere === TILE_BLUECUBE) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "blue") // Draw blue cube
  } else if (tileTypeHere === TILE_TURQUISECUBE) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 4,4, "Turquoise") // Draw wall2
  } else if (tileTypeHere === TILE_SHORTSWORD) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  } else if (tileTypeHere === TILE_LONGSWORD) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  } else if (tileTypeHere === TILE_SPEAR) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  } else if (tileTypeHere === TILE_HEALPOTION) {
    colorRectForMap(tileLeftEdgeX, tileTopEdgeY, 6,6, "gold") // Draw wall2
  }   
}


function tileCheckForTransparency() {
  if (tileTypeHasTransparency(tileTypeHere)) { // If that tile has transparancy
    if(localplayer.world === "global") {
      canvasContext.drawImage(tilePics[TILE_GROUND], 384, 192, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw the tile
    } else if (localplayer.world === "grove") {
      canvasContext.drawImage(tilePics[TILE_GROUND4], 672, 96, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw the tile
    } else if (localplayer.world === "ruin") {
      canvasContext.drawImage(tilePics[TILE_GROUND4], 672, 96, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw the tile
    }      
  }   // End of Transparency Check  
}

function tileCheckForDrawRoom() { // Determin which tile to draw in draw room
  tileTypeHere = roomGrid[drawroomtileindex]; // Figure out what type of tile to draw 
  tileCheckForTransparency();              
  if (tileTypeHere === TILE_GROUND) {
    canvasContext.drawImage(tilePics[tileTypeHere], 384, 192, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw ground
  } else if (tileTypeHere === TILE_GROUND2) {
    canvasContext.drawImage(tilePics[tileTypeHere], 32, 652, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw ground
  } else if (tileTypeHere === TILE_GROUND3) {
    canvasContext.drawImage(tilePics[tileTypeHere], 224, 192, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw ground
  } else if (tileTypeHere === TILE_GROUND4) {
    canvasContext.drawImage(tilePics[tileTypeHere], 672, 96, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw ground
  } else if (tileTypeHere === TILE_WALL) {
    canvasContext.drawImage(tilePics[tileTypeHere], 512, 96, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw wall
  } else if (tileTypeHere === TILE_WALL2) {
    canvasContext.drawImage(tilePics[tileTypeHere], 96, 112, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw wall
  } else if (tileTypeHere === TILE_WALL3) {
    canvasContext.drawImage(tilePics[tileTypeHere], 385, 320, 31,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw wall
  } else if (tileTypeHere === TILE_WALL4) {
    canvasContext.drawImage(tilePics[tileTypeHere], 864, 224, 31,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw wall
  } else if (tileTypeHere === TILE_WALL5) {
    canvasContext.drawImage(tilePics[tileTypeHere], 736, 416, 31,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw wall
  } else if (tileTypeHere === TILE_WALL6) {
    canvasContext.drawImage(tilePics[tileTypeHere], 768, 416, 31,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw wall
  } else if (tileTypeHere === TILE_CHEST) {
    canvasContext.drawImage(tilePics[tileTypeHere], 432,672, 16,16, tileLeftEdgeX + 4, tileTopEdgeY + 4, 24,24); // Draw chest
  } else if (tileTypeHere === TILE_DOOR) {
    canvasContext.drawImage(tilePics[tileTypeHere], 256, 926, 32,32, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw door
  } else if (tileTypeHere === TILE_BLUECUBE) {
    canvasContext.drawImage(tilePics[tileTypeHere], 566,382, 126,110, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw blue cube
  } else if (tileTypeHere === TILE_TURQUISECUBE) {
    canvasContext.drawImage(tilePics[tileTypeHere], 736,20, 124,126, tileLeftEdgeX, tileTopEdgeY, 32,32); // Draw turqoise cube
  } else if (tileTypeHere === TILE_SHORTSWORD) {
    canvasContext.drawImage(tilePics[tileTypeHere], 14,122, 32,32, tileLeftEdgeX + 4, tileTopEdgeY + 4, 24,24); // Draw shortsword
  } else if (tileTypeHere === TILE_LONGSWORD) {
    canvasContext.drawImage(tilePics[tileTypeHere], 44,122, 32,32, tileLeftEdgeX + 4, tileTopEdgeY + 4, 24,24); // Draw longsword
  } else if (tileTypeHere === TILE_SPEAR) {
    canvasContext.drawImage(tilePics[tileTypeHere], 140,122, 32,32, tileLeftEdgeX + 4, tileTopEdgeY + 4, 24,24); // Draw spear
  } else if (tileTypeHere === TILE_HEALPOTION) {
    canvasContext.drawImage(tilePics[tileTypeHere], 174,250, 32,32, tileLeftEdgeX + 4, tileTopEdgeY + 4, 24,24); // Draw healpotion
  }     
}

function instantCamFollow() { // Snap the camera to the player
  camPanX = Math.floor(localplayer.x - canvas.width/2); // move the camera half the canvas up and over
  camPanY = Math.floor(localplayer.y - canvas.height/2);
}

function cameraFollow() { // 
  instantCamFollow();
  if (camPanX < 0) { // if our values try to go negative, block them
      camPanX = 0;
  }
  if (camPanY < 0) {
      camPanY = 0;
  }
  maxPanRight = ROOM_COLUMNS * TILE_WIDTH - canvas.width; // width of our screen minus canvas width
  maxPanTop = ROOM_ROWS * TILE_HEIGHT - canvas.height;
  if(camPanX > maxPanRight) {// if we try to exceed the max value for that, stop the camera
    camPanX = maxPanRight;
  }
  if(camPanY > maxPanTop) {
    camPanY = maxPanTop;
  }
  consoleCamPan = "X: " + camPanX + " Y: " + camPanY;
}

function drawPlayerDeathMenu() {
  colorTextCinzelHuge("YOUR CHARACTER", 195, 110, "black");
  colorTextCinzelHuge("HAS DIED", 195, 200, "black");
  colorRect(100, 130, 110, 30, "green"); // Show Hitboxes button
  colorTextCinzel("OBSERVE", 155, 150, "yellow");
  colorRect(210, 130, 90, 30, "white"); // Debug button
  colorTextCinzel("QUIT", 255, 150, "black"); 
}

function handleMusicVolumeSlider() {
  if(!menuactive){return;}

  if (menudisplayed === "settings" && (mouseIsDown || usingTouchScreen)) {
    // if(isInFirstSlider) {
    //   range.pct=Math.max(0,Math.min(1,((mousePos.x/scalex)-range.x)/range.width)); // set new thumb & redraw
    //   firstLevelMusic.volume = Math.round(range.pct * 100) / 100;
    //   drawRangeControl(range);
    // }
    if(isInSecondSlider) {
      range2.pct=Math.max(0,Math.min(1,((mousePos.x/scalex)-range2.x)/range2.width)); // set new thumb & redraw
      drawRangeControl(range2);
      effectsgainvalue = Math.round(range2.pct * 100) / 100;
    }
  }
}




    

    //-----x---x---x--- Event Listeners
    canvas.addEventListener("mousemove", function(evt) { // Event listener to display the mouse position based on calculateMousePos
        mousePos = calculateMousePos(evt);
        isInFirstSlider=(isScaledMouseOverBox(16,183,65,95));
        isInSecondSlider=(isScaledMouseOverBox(16,183,145,175));
        handleMusicVolumeSlider();
        handleMapDrag();
        if (clickDown && editorActive) {
            editorInput();
        } else if (!menuactive && clickDown && !editorActive) {
            handleGameMapClicks();
        } else if (menuactive && clickDown && !editorActive && Math.floor(mousePos.x/scalex) > 200) {
            trackClicksWhileMenuOpen();
        }
    });

    canvas.addEventListener("mouseup", function(evt) { // Event listener to display the mouse position based on calculateMousePos
        mousePos = calculateMousePos(evt);
        isInFirstSlider = false;
        if(!usingTouchScreen) {
             mouseIsDown = false;
        }
        clickDown = false;
    });

    clickDown = false;

    canvas.addEventListener("mousedown", function(evt) { // Event listener for clicks based on calculateMousePos
        mousePos = calculateMousePos(evt);   
        isInFirstSlider=(isScaledMouseOverBox(16,183,65,95));
        isInSecondSlider=(isScaledMouseOverBox(16,183,145,175));
        handleClicks(); // Location of mouse clicks/screen touches and variables they coincide with
        if(!usingTouchScreen) {
            mouseIsDown = true;
        }
        clickDown = true;    
    });

   

    canvas.addEventListener("click", function(evt) { // Event listener for clicks based on calculateMousePos
        // if(usingTouchScreen){return;}
      
        mousePos = calculateMousePos(evt);
        
        isInFirstSlider=(isScaledMouseOverBox(16,183,65,95));
        isInSecondSlider=(isScaledMouseOverBox(16,183,145,175));
        usingTouchScreen = false;
    });

    canvas.addEventListener('touchmove', function(evt) { // listen for touch end event on mobile
        evt.preventDefault(); // tell the browser we're handling this event
        evt.stopPropagation();
        mousePos = calculateMousePos(evt);
        isInFirstSlider=(isScaledMouseOverBox(16,183,65,95));
        isInSecondSlider=(isScaledMouseOverBox(16,183,145,175));
        if (isInFirstSlider || isInSecondSlider) {
          handleMusicVolumeSlider();
        }
        
        if (menuactive && menudisplayed === "map") {
          handleMapDrag();
        }

        
        usingTouchScreen = true;

        if (editorActive) {
            editorInput();
        } else if (!menuactive && !editorActive) {
            handleGameMapClicks();
        } else if (menuactive && !editorActive) {
            trackClicksWhileMenuOpen();
        }  
    }, {passive: false});

    $(window).bind("beforeunload", function() { // For if the browser leaves by hitting the home button
        sendLeavePing();
        runExitTimer();
        exitinggame = true;
        if (show_close_alert) {
            sendLeavePing();
            runExitTimer();
            exitinggame = true;
        }
    });

    window.addEventListener("popstate", function (event) { // For detecting the back button
        sendLeavePing();
        runExitTimer();
        exitinggame = true;
    });

    $(document).on("keypress", "form", function(event) { 
        return event.keyCode != 13;
    });

    function unlockAudioForIOS (thecontext){ // iOS audiocontext detection and unlock
      if (thecontext.state === 'suspended' && 'ontouchstart' in window) { // if safari on iOS has suspended the audioContext
          usingIOS = true; // Flag that we are using iOS safari for playing audio
          var listenerRemoval = function() { // embedded function to remove event listeners after unlocked
              thecontext.resume().then(function() { // Set the AudioContext to resume since iOS suspends it until user interaction
              document.body.removeEventListener('touchstart', listenerRemoval); // Do so on touchstart -- iOS 8 and lower
              document.body.removeEventListener('touchend', listenerRemoval); // Do so on touchend -- iOS 9 and up confuses it with touchmove
              });
          };
          document.body.addEventListener('touchstart', listenerRemoval, false);
          document.body.addEventListener('touchend', listenerRemoval, false);
      }
  }

  getOS();

  unlockAudioForIOS(soundcontext);

  requestBoom.send(); // Send request for playerdeath sound
  requestTing.send(); // Send request for metallic hit sound
  requestLifeLow.send(); // Send request for low health sound
  requestEnemyAttack.send(); // Send request for enemy Attack sound



}























































 function splashKickOff() {


    gon.watch("thisuser", grabUser); // Snags the user object from Ruby, and passes it to the grabUser Callback
  function grabUser (obj) { // Set the recieved object to a Javascript variable we can pass to the canvas
    userholder = obj;
    if(userholder === null){
      useremail = "";
    }
    else {
      useremail = userholder.email;
    }
  }


    //---------- Rails to Canvas using Gon gem ------------
    var useremail = '';

    

    let splashimg = new Image();
    splashimg.src = 'https://goo.gl/K8nnjk'; // Short url for background image
    let backgroundYPos = 0;
    let backgroundGoingDown = true;

    let ratio = 1; // Ratio is set after a resize is called
    let scalex = 1; // Modifier for scaled screensize x
    let scaley = 1; // Modifier for scaled screensize y
    
    let canvas = document.getElementById('indexCanvas'); // Get the canvas reference from DOM
    let loyal_canvas = document.getElementById('LoyalCanvas');
    canvas.width = 500;
    canvas.height = 500;
    let canvasContext = canvas.getContext('2d'); // Get the canvas context for main interface
    let gradient=canvasContext.createLinearGradient(0,0,canvas.width,canvas.height); // Set starting color scheme
    gradient.addColorStop("0.1","magenta");
    gradient.addColorStop("0.3","blue");
    gradient.addColorStop("0.7","red");

    let entSystemTextX = -230; // Position anchors for sliding interface
    let entSystemTextY = 290;
    let pressStartTextY = 520;
    let creditsTextY = 550;
    let startButtonY = -50;
    let fullScreenButtonY = -50;
    let mainLogoY = 264;
    let copyrightTextY = 310;

    let gameplay = false; // measures if user is in gameplay section
    let startPressed = false; // Start button has been pressed
    let aboutPressed = false; // About button has been pressed
    let loginPressed = false; // Login button has been pressed

    let mouseX = 0; // Stores Raw mouse position as Reported by the browser
    let mouseY = 0; // Stores Raw mouse position as Reported by the browser
    
    let f; // Flip loop iterator
    let e; // event object
    
    let introtime = 0; // Amount of time to give the player at the start to get their shit together

    let held = false; // true if the player is holding touch or the mouse down
    let touchActive; // true if the player is currently touching the screen
    let title = true; // true if at the initial title screen

    let gradientCycleValue = 0.3; // gradient cycle initial value
    let gradientIterator = 5; // How fast to cycle the animated gradient
    let gradientRising = true; // Which direction (Up or down) the gradient is iterating

    let titleTextPosition = 100;
    let titleTextRising = true;

    let titleTextSlidePosition = -900;

    let titleTime = 0; // time value for displaying intro sequence

    let locationIntro; // bottom sliding text
    let locationIntroUpperFull;

    let barberPoleReference = 0; // where on x axis to start animated sideways barberpole at boot
    let poleLineColor = 'green'; // first color in the sequence

    let greyFadeRGBvalue = 0; // initial value for fade to konami screen
    let greyFadeRGB = "sampletext"; // will be formated CSS value based on current value

    let gameOfLifeButtonY = 30; // initial values for y axis slide on menu items
    let pixelBricksButtonY = 30;
    let panicSquaredButtonY = 30;
    let aboutButtonY = 30;
    let backButtonOneY = 30;

    let pixelBricksURL = "/info/pixelbricks"; // context links for interface
    let gameOfLifeURL = "/info/lifedemo";
    let loyalURL = "/chat_rooms/1";
    let loginURL = "/users/sign_in";
    let logoutURL = "/welcome/logout";

    let dragMotionValue = 0;
    let axisYBeforeSwipe;
    let aboutButtonTextY = 150;
    let mainMenuTime = 0;
    var backgroundZoomLevel = 850;

    //---------- AnimationFrame ------------
    function playlife(timestamp){
        requestAnimationFrame(playlife) // call requestAnimationFrame again to animate next frame
        updateAll();  

    }
    requestAnimationFrame(playlife) // call requestAnimationFrame and pass into it animation function

    // ------ Setup Code End -------
    // ---------- Event Listener Section -------------------
    // Input event Listener Section

    canvas.addEventListener('mousedown', function() { // Listen for the mouse down event
      
      handleInputPositionCases();
      touchActive = true; // consider touch to be active for mobile devices
    }, false); 
    canvas.addEventListener('mousemove', positionHandler, false); // listen for mousemovement and update the curser

    canvas.addEventListener('mouseup', function() {  // Listen for the  mouse up event
      
      touchActive = false; // touch is no longer active as judged by mobile devices
    }, false); 

    window.addEventListener('touchmove', function(e) { // listen for touch end event on mobile
      positionHandler(e);
      touchActive = true;
      if(aboutPressed) {
        handleSwipeMotion();
      }  
    }, {passive: false});

    window.addEventListener('touchend', function(e) { // listen for touch end event on mobile
      touchActive = false; // Touch is no longer considered to be active
    }, {passive: false});

    function positionHandler(e) {
      let rect = canvas.getBoundingClientRect(); // Get the size of the canvas
      let root = document.documentElement; // Get the document root from the DOM
      if ((e.clientX)&&(e.clientY)) {  
        mouseX = e.clientX - rect.left - root.scrollLeft; // Get the origin for the Left
        mouseY = e.clientY - rect.top - root.scrollTop; // and top sides of the screen
        if (aboutPressed) {
          handleDragMotion();
        } 
      } else if (e.targetTouches) {   
        mouseX = Math.floor(e.targetTouches[0].clientX - rect.left - root.scrollLeft); // Get the origin for the Left
        mouseY = Math.floor(e.targetTouches[0].clientY - rect.top - root.scrollTop); // and top sides of the screen
        e.preventDefault();
      }
    }

    function handleSwipeMotion() { // handle the values generated by swipe type movements and clicking and dragging a mouse
      if(touchActive) { // If the screen is being touched or clicked at all
        // console.log("touchisActive");
        if (axisYBeforeSwipe > Math.floor(mouseY/scaley)) {
          if (dragMotionValue < -45) {
            dragMotionValue--;
          }
          else {
            dragMotionValue = dragMotionValue - 6;
          }    
        }
        else if (Math.floor(mouseY/scaley) > axisYBeforeSwipe) {
          if (dragMotionValue > 135) {
            dragMotionValue++;
          }
          else{
            dragMotionValue = dragMotionValue + 6;
          }  
        } 
      } // End of if touchActive
    } // End of function

    function handleDragMotion() { // handle the values generated by swipe type movements and clicking and dragging a mouse
      if(touchActive) { // If the screen is being touched or clicked at all
        // console.log("touchisActive");
        if (axisYBeforeSwipe > Math.floor(mouseY/scaley)) {
          if (dragMotionValue < -45) {
            dragMotionValue--;
          }
          else {
            dragMotionValue = dragMotionValue - (axisYBeforeSwipe - Math.floor(mouseY/scaley));
          }    
        }
        else if (Math.floor(mouseY/scaley) > axisYBeforeSwipe) {
          if (dragMotionValue > 135) {
            dragMotionValue++;
          }
          else{
            dragMotionValue = dragMotionValue + (Math.floor(mouseY/scaley) - axisYBeforeSwipe);
          }  
        } 
      } // End of if touchActive
    } // End of function

    // Game Specific helper functions

    function handleAboutButton() {  
      if (aboutPressed) { // if the about button pressed is true
        colorTextBitter("Welcome to my arcade themed portfolio", 50, aboutButtonTextY + dragMotionValue, "white");
        colorTextBitter("site, which will feature several projects.", 57, (aboutButtonTextY + 30) + dragMotionValue, "white");
        colorTextBitter("The most recent project is RAGE, or", 68, (aboutButtonTextY + 60) + dragMotionValue, "white");
        colorTextBitter("Rails Action Game Engine, and Rails MMO;", 50, (aboutButtonTextY + 90) + dragMotionValue, "white");
        colorTextBitter("both of which will be published", 60, (aboutButtonTextY + 120) + dragMotionValue, "white");
        colorTextBitter("to my Github in the next 48 hours.", 70, (aboutButtonTextY + 150) + dragMotionValue, "white");
        colorTextBitter("Updated on Wednesday, Jan 9th, 2019", 70, (aboutButtonTextY + 180) + dragMotionValue, "white");

        if (dragMotionValue < -75) {
          dragMotionValue = -75;
        }
        else if (dragMotionValue > 105) {
          dragMotionValue = 105;
        }
        else {      
        }  
        if (mainLogoY < 464) { // Handle logo shift on whether about pressed or not
          mainLogoY = mainLogoY + 5;
        }
        if (copyrightTextY < 510) {
          copyrightTextY = copyrightTextY + 5;
        }
        if (entSystemTextY < 490) {
          entSystemTextY = entSystemTextY + 5;
        }
        if (creditsTextY < 520) {
          creditsTextY = creditsTextY + 5;
        }
      }
      else {
        if (mainLogoY > 364) {
          mainLogoY = mainLogoY - 5;
        }
        if (copyrightTextY > 410) {
          copyrightTextY = copyrightTextY - 5;
        }
        if (entSystemTextY > 390) {
          entSystemTextY = entSystemTextY - 5;
        }
        if (creditsTextY < 490) {
          creditsTextY = creditsTextY + 5;
        }
      }
    }

    function sizeForSplashScreen() {

    }

    function updateAll() { // Primary Function containing all game tasks
      drawAll(); // Update the screen
      resize(); // Check canvas size - if not a match resize
      setGradient("magenta", "blue", "red"); // Update color cycles for menu
      axisYBeforeSwipe = Math.floor(mouseY/scaley);
    }

    function drawAll() {  // Draw screens based upon running conditions   
      colorRect(0,0, canvas.width,canvas.height, 'black'); // clear screen
      if(title) { // If we're supposed to be at the Intro title screen
        drawTitleScreen(); // Then draw title screen
      }
      else { // Or if we're in normal play     
        titleTime = 0;
        drawGamePlay(); // Draw the in game screen
        handleGradientCycle();
      }
      // colorText(Math.floor(mouseX/scalex)+","+Math.floor(mouseY/scaley)+","+dragMotionValue + ", " + axisYBeforeSwipe, mouseX/scalex,mouseY/scaley, 'yellow');// Draw Debug Mouse Position
    }

    function drawGamePlay() { // Draw the screen After the Intro
      gameplay = true;
      colorRect(0,0, canvas.width,canvas.height, 'black'); // clear screen  
      drawMainMenuElements();
      handleStartButton();
      handleAboutButton();
    }

   function isScaledMouseOver(x1,x2,y1,y2) { // Calculate whether scaled input fits within any box // Will need generalized between canvases
      if (Math.floor(mouseX/scalex) > x1 && Math.floor(mouseX/scalex) < x2 && Math.floor(mouseY/scaley) > y1 && Math.floor(mouseY/scaley) < y2) {
        return true;
      } else {
        return false;
      }
    }

    function handleInputPositionCases() {
      if(isScaledMouseOver(335,499,1,50) && (gameplay || title) ) { // If it's over the fullscreen button and it's showing
        toggleFullscreen(); // Request Browser Fullscreen
      }
      if(isScaledMouseOver(180,295,1,50) && (gameplay || title) ) { // If it's over the Login/Logout button
        if(useremail === '') {
          $('#myModal').modal();
          // window.location = loginURL;
        } else {
          window.location = logoutURL;
        }
      }
      if(isScaledMouseOver(1,100,1,50) && gameplay) { // If it's over the Start button and it's showing
        if (startPressed === false) {
          startPressed = true;
        }
        else {
          startPressed = false;
          aboutPressed = false;
          dragMotionValue = 0;
        }
      } else if (isScaledMouseOver(170,315,375,400) && gameplay) { // if it's over the press start text do the same, since many users click there
        if (startPressed === false) {
          startPressed = true;
        }
        else {
          startPressed = false;
          aboutPressed = false;
          dragMotionValue = 0;
        }
      }
      // if(isScaledMouseOver(1,160,100,145) && startPressed && !aboutPressed)  { // If start button pressed and pixelbricks link pressed
      //   window.location = pixelBricksURL;
      // }
      // if(isScaledMouseOver(1,170,50,95) && startPressed && !aboutPressed) { // If start button pressed and Game of life link pressed
      //   window.location = gameOfLifeURL;
      // }
      if(isScaledMouseOver(1,145,150,195) && startPressed && !aboutPressed ) { // If start button pressed and Loyal Testing link pressed
        if(useremail === '') { // If not logged in
          $('#myModal').modal(); // Bring up login modal
        } else {
          // window.location = loyalURL; // Direct to Loyal URL
          // Hide the Splash Canvas
          canvas.style.display = "none";
          // Show the Loyal Canvas
          loyal_canvas.style.display = "block";
          // Launch Loyal Kickoff
          LoyalKickOff();
          
          playlife = null; // nullify splash screen context
         
          
          splashKickOff = null; // nullify entire splash function and namespace
          
        }
      }
      if(isScaledMouseOver(1,95,200,245) && startPressed && !aboutPressed) { // If start button pressed and about link pressed
        aboutPressed = true;
      }
      if(isScaledMouseOver(1,200,1,70) && title) { // If it's over the Skip intro button and it's showing
        title = false; // skip intro title
      }
    }

    function drawTitleScreen() {
      if (useremail !== '') { // If user is logged in, skip intro title
        title = false;
      }
    //  -------- Timing for Konami screen forward
      if (titleTime < 380) {
        colorRect(0,0, canvas.width,canvas.height, 'black'); // clear screen
      }
      else if (titleTime < 400) {
        greyFadeRGB = "rgb(" + greyFadeRGBvalue + ", " + greyFadeRGBvalue + ", " + greyFadeRGBvalue + ")";
        colorRect(0,0, canvas.width,canvas.height, greyFadeRGB); // clear screen
        greyFadeRGBvalue = greyFadeRGBvalue + 15; // fade to bright quickly
        colorTextFancy("SKIP INTRO", 5, 20,'red');// Show intro skip button
      }
      else if (titleTime < 450) {
        colorRect(0,0, canvas.width,canvas.height, 'white'); // clear screen
        colorTextFancy("© 2018 SHREWDPIXEL", 130, 230,'blue');// Show start prompt
        colorTextFancy("SKIP INTRO", 5, 20,'grey');// Show start prompt
      }
      else if (titleTime < 470) {
        colorRect(0,0, canvas.width,canvas.height, 'black'); // clear screen
        colorTextFancy("SKIP INTRO", 5, 20,'grey');// Show start prompt
        canvasContext.font="53px Cinzel Decorative";
        canvasContext.font = `53px Cinzel Decorative`; // sets the font and size into buffer
      }
      else {
        colorRect(0,0, canvas.width,canvas.height, 'black'); // clear screen
        title = false;
      }
        //  -------- Timing for Arcade boot screen

      if (titleTime > 20 && titleTime < 380) {
        if (useremail === '') {
          locationIntro = "USER NOT YET LOGGED IN";
        }
        else {
          
          locationIntro = "USER LOGGED IN AS " + useremail;
        }
        locationIntroUpperFull = locationIntro + " - " + locationIntro +  " - " + locationIntro +  " - " + locationIntro +  " - " + locationIntro;

        colorTextFancy("SKIP INTRO", 5, 20,'red');// Show start prompt
        drawBoxedTextWhite("FULLSCREEN", 350, 30, 140);  // Draw the fullscreen button
      
        colorRect(0,444,500,21,'sienna');

        colorTextFancy(locationIntroUpperFull, titleTextSlidePosition, 462,'khaki');// Show start prompt
        titleTextSlidePosition = titleTextSlidePosition + 2;

        drawTitleConsoleText();

        for (let polesections = 1; polesections < 150; polesections++) { // Draw the barber-pole like color stream at the start
          if (polesections % 5 == 0) {// arrange the color order mathematically based on modulos so the range can be anything
            poleLineColor = 'green';
          } else if (polesections % 4 == 0) {
            poleLineColor = 'yellow';
          } else if (polesections % 3 == 0) {
            poleLineColor = 'blue';
          } else if (polesections % 2 == 0) {
            poleLineColor = "orange";
          } else {
            poleLineColor = 'red';
          }
          for(let eachLine=0;eachLine<50;eachLine += 10) {
            colorline30(barberPoleReference + (polesections * 30) - eachLine, 260 - (eachLine/2), poleLineColor);
          } 
        }

        colorRect(0,220,80,90,'black'); // draw black bars outside of edges to obscure how barber pole paints the width of the screen
        colorRect(405,220,100,90,'black');
        colorRect(80,240,20,25,'LightGoldenRodYellow'); // Draw edges of barber pole
        colorRect(385,240,20,25,'LightGoldenRodYellow');

        barberPoleReference = barberPoleReference - 10; // move the barber pole reference by 10 pixels each time this routine is called
        drawColorBars();
        drawRomIcons();
      }
        //  -------- Timer increment for title
      titleTime++;
    }

    function drawColorBars() {   //  draw static old scholl grey and color bars at arcade boot screen
      colorSquare25(70,340, 'gold');
      colorSquare25(95,340, 'goldenrod');
      colorSquare25(120,340, 'peachpuff');
      colorSquare25(145,340, 'pink');
      colorSquare25(170,340, 'lavenderblush');
      colorSquare25(195,340, 'orchid');
      colorSquare25(220,340, 'violet');
      colorSquare25(245,340, 'skyblue');
      colorSquare25(270,340, 'lightblue');
      colorSquare25(295,340, 'paleturquoise');
      colorSquare25(320,340, 'mediumturquoise');
      colorSquare25(345,340, 'mediumaquamarine');
      colorSquare25(370,340, 'mediumspringgreen');
      colorSquare25(395,340, 'yellowgreen');
      colorSquare25(70,370, 'rgb(255, 255, 255)');
      colorSquare25(95,370, 'rgb(236, 236, 236)');
      colorSquare25(120,370, 'rgb(216, 216, 216)');
      colorSquare25(145,370, 'rgb(198, 198, 198)');
      colorSquare25(170,370, 'rgb(180, 180, 180)');
      colorSquare25(195,370, 'rgb(162, 162, 162)');
      colorSquare25(220,370, 'rgb(144, 144, 144)');
      colorSquare25(245,370, 'rgb(126, 126, 126)');
      colorSquare25(270,370, 'rgb(108, 108, 108)');
      colorSquare25(295,370, 'rgb(90, 90, 90)');
      colorSquare25(320,370, 'rgb(72, 72, 72)');
      colorSquare25(345,370, 'rgb(54, 54, 54)');
      colorSquare25(370,370, 'rgb(36, 36, 36)');
      colorSquare25(395,370, 'rgb(18, 18, 18)');
    }

    function drawBackground() {
      canvasContext.drawImage(splashimg, 0 - backgroundZoomLevel/2, backgroundYPos,500 + backgroundZoomLevel,1500 + backgroundZoomLevel); // Draw Draw background image
    }

    function animateMainMenuBackground() {
      mainMenuTime++;    
      if (mainMenuTime % 8 === 1) {
        backgroundZoomLevel--;
        if (backgroundZoomLevel < 0) {
          backgroundZoomLevel = 0;
        }
      }
      if (mainMenuTime % 4 === 1) {
        if (backgroundGoingDown) {
          backgroundYPos--;
        } else {
          backgroundYPos++;
        }
      }
      if (backgroundYPos === -1000) {
        backgroundGoingDown = false;
      }
      if (backgroundYPos === 1) {
        backgroundGoingDown = true;
      }
      if (mainMenuTime < 1000) {
        canvasContext.globalAlpha = mainMenuTime / 1000;
        drawBackground();    
        canvasContext.globalAlpha = 1;  
      }
      else {
        drawBackground();
      }  
    }

    function drawMainMenuElements() { // Draw the elments that are always on the Main menu
      animateMainMenuBackground();
      colorTextTitle("RAGE BETA", 90,mainLogoY, gradient);
      colorTextSmall("© 2018 SHREWDPIXEL", 270,copyrightTextY, gradient);
      drawBoxedText("FULLSCREEN", 350, fullScreenButtonY, 140); // Draw the fullscreen button
      if(useremail === '') {
        drawBoxedText("SIGN IN", 180, fullScreenButtonY, 94); // Draw the fullscreen button
      } else {
        drawBoxedText("SIGN OUT", 180, fullScreenButtonY, 113); // Draw the fullscreen button
      }  
      colorTextBitter("RAILS ACTION GAMING ENGINE", entSystemTextX, entSystemTextY, "white");
      colorTextBitter("CREDITS ∞", 380, creditsTextY, "white");
      colorTextBitter(useremail, 5, creditsTextY, "white"); // Draw user email if logged in, else empty string that doesn't show
    }

    function drawTitleConsoleText() { // Draw sliding and updating text at arcade boot
      colorTextFancy("RAGE ", 120, titleTextPosition,'white');// Bouncing text
      colorTextFancy("RAILS ACTION", 215, titleTextPosition,'khaki');
      colorTextFancy("          GAMING ENGINE", 120, (titleTextPosition + 20),'khaki');
      colorTextFancy("ALPHA", 120, (titleTextPosition + 50),'khaki');
      colorTextFancy(" 0.5", 320, (titleTextPosition + 50),'white');

      if (titleTime < 100) {
        colorTextFancy("POWER ON", 120, 320,'white');// Show start prompt
      }
      else if (titleTime < 110) {
        colorTextFancy("DUMPING POLIBIUS ROM", 120, 320,'white');// Draw sequence of startup messages at boot screen
      }
      else if (titleTime < 250) {
        colorTextFancy("CHECKING ROMS", 120, 320,'white');
      }
      else if (titleTime < 270) {
        colorTextFancy("RECALCULATING TIME", 120, 320,'white');
      }
      else if (titleTime < 300) {
        colorTextFancy("TESTING INPUT", 120, 320,'white');
      }
      else {
        colorTextFancy("STARTING ARCADE", 120, 320,'white');
      } 
      if (titleTextRising) { // Manage the up and down motion of the top boot text
        titleTextPosition = titleTextPosition + 1;
      } else {
        titleTextPosition = titleTextPosition - 1;
      }
      if (titleTextPosition == 130) {
        titleTextRising = false;
      }
      if (titleTextPosition == 100) {
        titleTextRising = true;
      }
    }

    function handleStartButton() {
      if (startPressed) { // if start has been pressed, arrange the menu
        if (gameOfLifeButtonY < 80) {
          gameOfLifeButtonY = gameOfLifeButtonY + 10;
        }
        if (pixelBricksButtonY < 130) {
          pixelBricksButtonY = pixelBricksButtonY + 10;
        }
        if (panicSquaredButtonY < 180) {
          panicSquaredButtonY = panicSquaredButtonY + 10;
        }
        if (aboutButtonY < 230) {
          aboutButtonY = aboutButtonY + 10;
        }
        if (mainLogoY < 364) {
          mainLogoY = mainLogoY + 5;
        }
        if (copyrightTextY < 460) {
          copyrightTextY = copyrightTextY + 5;
        }
        if (entSystemTextY < 390) {
          entSystemTextY = entSystemTextY + 5;
        }
        if (aboutPressed === false) { // If about has not been pressed yet
          // drawBoxedText("GAME OF LIFE", 10, gameOfLifeButtonY, 155); // Draw the expanded menu
          // drawBoxedText("PIXELBRICKS", 10, pixelBricksButtonY, 148);
          drawBoxedText(" MMO TEST ", 10, panicSquaredButtonY, 135); 
          drawBoxedText("ABOUT", 10, aboutButtonY, 82); 
          axisYBeforeSwipe = Math.floor(mouseY/scaley); // Set a baseline for input before presenting a scrollable interface
        }
        drawBoxedText("BACK", 10, backButtonOneY, 68); 
      }
      else { // Start has not been pressed, so everything should be snapped in place
        colorTextBitter("PRESS START", 180, pressStartTextY, "white");
        drawBoxedText("START", 10, startButtonY, 80); // Draw the Start button
        if (gameOfLifeButtonY > 30) {
          gameOfLifeButtonY = gameOfLifeButtonY - 10;
        }
        if (pixelBricksButtonY > 30) {
          pixelBricksButtonY = pixelBricksButtonY - 10;
        }
        if (panicSquaredButtonY > 30) {
          panicSquaredButtonY = panicSquaredButtonY - 10;
        }
        if (aboutButtonY > 30) {
          aboutButtonY = aboutButtonY - 10;
        }
        if (entSystemTextX < 85) { // Incremental speed slide 
          entSystemTextX += 2;
          if(entSystemTextX < 85) {
            entSystemTextX += 2;
            if(entSystemTextX < 85) {
              entSystemTextX += 2;
              if(entSystemTextX < 85) {
                entSystemTextX += 2;
              }
            }
          }
        }
        if (pressStartTextY > 400) {
          pressStartTextY = pressStartTextY - 7;
        }
        if (creditsTextY > 490) {
          creditsTextY = creditsTextY - 4;
        }
        if (startButtonY < 30) {
          startButtonY = startButtonY + 5;
        }
        if (fullScreenButtonY < 30) {
          fullScreenButtonY = fullScreenButtonY + 5;
        }
        if (mainLogoY > 264) {
          mainLogoY = mainLogoY - 10;
        }
        if (copyrightTextY > 310) {
          copyrightTextY = copyrightTextY - 10;
        }
        if (entSystemTextY > 290) {
          entSystemTextY = entSystemTextY - 10;
        }  
      }
    }

    function drawSingleRomIcon(time,text,x,y,length) {
      if (titleTime < time) {drawBoxedTextWhite(text, x, y, length);  // Draw inactive icon
      } else {drawBoxedTextFlipped(text, x, y, length);  // Draw activated icon
      }
    }

    function drawRomIcons() { // draw either clear or filled rom icons at arcade boot
      drawSingleRomIcon(20,"U17",440,100,50);
      drawSingleRomIcon(40,"U16",440,150,50);
      drawSingleRomIcon(60,"U14",440,200,50);
      drawSingleRomIcon(100,"U12",440,250,50);
      drawSingleRomIcon(120,"U50",440,300,50);
      drawSingleRomIcon(140,"U64",440,350,50);
      drawSingleRomIcon(160,"U49",440,400,50);
      drawSingleRomIcon(180,"U2",18,100,38);
      drawSingleRomIcon(200,"U5",18,150,38);
      drawSingleRomIcon(250,"U7",18,200,38);
      drawSingleRomIcon(280,"U6",18,250,38);
      drawSingleRomIcon(300,"U9",18,300,38);
      drawSingleRomIcon(320,"U4",18,350,38);
      drawSingleRomIcon(370,"U8",18,400,38);
    }

    // Generalized helper functions
    function setGradient(color1, color2, color3) { // Empties the gradient and sets a new one with 3 color inputs
      gradient = null;  // Kill the previous gradient
      gradient=canvasContext.createLinearGradient(0,0,canvas.width,canvas.height); // Set a new one for our canvas
      gradient.addColorStop(0.0,color1); // add all 3 colors
      gradient.addColorStop(gradientCycleValue,color2); // Testing For orientation highlight
      gradient.addColorStop(1.0,color3);
    }

    function handleGradientCycle() {
      if (gradientRising == true) {
        gradientIterator = gradientIterator + 2;
      } else {
        gradientIterator = gradientIterator - 2;
      }
      if (gradientIterator == 95) {
        gradientRising = false;
      }
      if (gradientIterator == 5) {
        gradientRising = true;
      }
      gradientCycleValue = gradientIterator / 100;
    }

    function colorRect(topLeftX,topLeftY, boxWidth,boxHeight, fillColor) { // General canvas Rectangle function // Needs Generalized between canvases
      canvasContext.fillStyle = fillColor;
      canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
    }

    function colorTextSmall(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function // Needs Generalized between canvases
      canvasContext.font="10px Verdana";
      canvasContext.fillStyle=fillColor;
      canvasContext.fillText(showWords, textX,textY);
    }

    function resize() { // resizes the canvas to the window width and height       // Needs Generalized between canvases
      if (canvas.currentHeight !== window.innerHeight || canvas.currentWidth !== window.innerWidth) { // If we're not already perfectly sized for width and height
        canvas.currentHeight = window.innerHeight; // Size us with the height first
        ratio = window.innerWidth / window.innerHeight; // Then compute the aspect ratio of the window
        
        canvas.currentWidth = canvas.currentHeight * ratio; // And resize the width to that ratio
        scalex = canvas.currentWidth / canvas.width; // Our scale can now be computed based upon the original width
        scaley = canvas.currentHeight / canvas.width; // And height of the canvas vs it's new size, which we'll need for correct input
        canvas.style.width = canvas.currentWidth + 'px'; // scale the canvas with CSS
        canvas.style.height = canvas.currentHeight + 'px';
      }
    }






    function colorSquare50(topLeftX,topLeftY, color) { // Intro specific
      colorRect(topLeftX, topLeftY, 50, 50, color);
    }

    function colorSquare25(topLeftX,topLeftY, color) { // Intro specific
      colorRect(topLeftX, topLeftY, 25, 25, color);
    }

    function colorline50(topLeftX,topLeftY, color) { // Intro specific
      colorRect(topLeftX, topLeftY, 50, 5, color);
    }

    function colorline30(topLeftX,topLeftY, color) { // Intro specific
      colorRect(topLeftX, topLeftY, 30, 5, color);
    }

    function colorText(showWords, textX,textY, fillColor) { // General canvas Text function // Intro specific
      canvasContext.fillStyle = fillColor;
      canvasContext.fillText(showWords, textX,textY);
    }

    function colorTextFancy(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function // Intro specific
      canvasContext.font="20px Verdana";
      canvasContext.fillStyle=fillColor;
      canvasContext.fillText(showWords, textX,textY);
    }

    function colorTextBitter(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function  // Intro specific
      canvasContext.font="20px Bitter";
      canvasContext.fillStyle=fillColor;
      canvasContext.fillText(showWords, textX,textY);
    }

    function colorTextTitle(showWords, textX,textY, fillColor) { // 20px Verdana canvas Text function // Intro specific
      canvasContext.font="53px Cinzel Decorative";
      canvasContext.fillStyle=fillColor;
      canvasContext.fillText(showWords, textX,textY);
    }

    function drawBoxedText(text, textX,textY, innerLength) { // Draw text with border for buttons  // Intro specific
      colorRect((textX - 10),(textY - 30), (innerLength + 10), 45, gradient); // outside box  
      colorRect((textX - 5),(textY - 25), innerLength,35, 'black'); // inside box
      colorTextFancy(text, textX,textY, gradient);// text in box
    }

    function drawBoxedTextWhite(text, textX,textY, innerLength) { // Draw text with border for buttons // Intro specific
      colorRect((textX - 10),(textY - 30), (innerLength + 10), 45, 'white'); // outside box  
      colorRect((textX - 5),(textY - 25), innerLength,35, 'black'); // inside box
      colorTextFancy(text, textX,textY, 'white');// text in box
    }

    function drawBoxedTextFlipped(text, textX,textY, innerLength) { // Draw text with border for buttons // Intro specific
      colorRect((textX - 10),(textY - 30), (innerLength + 10), 45, 'greenyellow'); // outside box  
      colorRect((textX - 5),(textY - 25), innerLength,35, 'greenyellow'); // inside box
      colorTextFancy(text, textX,textY, 'black');// text in box
    }

 }

splashKickOff();

}); // End Document.TurboLinks.load function
