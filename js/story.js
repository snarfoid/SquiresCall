


var Squire = {};
Squire.sitePrefix = 'phpSquire';
Squire.chapter = "1";
Squire.storyEvents = {};
Squire.eventKeyList = [];
Squire.storyStrings = {};
Squire.loading;
Squire.loadTries = 0;
Squire.loadInterval = 10;
Squire.elements = {};
Squire.fields = ['choiceCount',
                'eventType',
                'eventKey',
                'location',
                'person',
                'preReqCount',
                'preReqJoin',
                'talkCharm',
                'talkCautious',
                'talkHumor',
                'talkThreat',
                'talkInsult',
                'talkReaction',
                'text'
                ];


$().ready(function() {
    initElements();
    setupMessageDialog();
    loadStoryStrings();
    loadStoryEvents();
    setupLocationDialog();
    setupPersonDialog();
    changeEventType();
   
});

var initElements = function() {
  for(var i= 0; i<Squire.fields.length; i++) {
    Squire.elements[Squire.fields[i]] = $("#" + Squire.fields[i] + "_field");
  }
}

var loadStoryStrings = function() {
  $.ajax({
    url: "strings/" + Squire.chapter,
    dataType: 'json'
  })
  .done(function(response) {
    Squire.storyStrings = response;
    Squire.locations = [];
    for (loc in Squire.storyStrings.locations) {
      if (Squire.storyStrings.locations.hasOwnProperty(loc)) {
        Squire.locations.push(loc);
      }
    }
    $( "#location_field" ).autocomplete({
      source: Squire.locations
    });
  })
  .fail(function() {

  });
}

var loadStoryEvents = function() {
  $.ajax({
    url: "events/" + Squire.chapter,
    dataType: "json"
  })
  .done(function(response) {
    
    // clear out anything already there
    Squire.storyEvents = response;
    Squire.loading = setInterval(buildSideBar, Squire.loadInterval);
  })
  .fail(function() {

  });
}

var buildSideBar = function() {
  if (Squire.loadTries > 10) {
    clearInterval(Squire.loading);
    Squire.loadInterval *= 10;
    if (Squire.LoadInterval > 1000) {
      emitMessage("Load Error");
      return;
    }
    Squire.loading = setInterval(buildSideBar, Squire.loadInterval)
  }
  if (isEmpty(Squire.storyEvents) || isEmpty(Squire.storyStrings)) {
    Squire.loadTries++;
  }
  clearInterval(Squire.loading);

  var sidebar = $('#sideBar div.content');
  sidebar.innerHtml = "";
  for (attr in Squire.storyEvents) {
    if (Squire.storyEvents.hasOwnProperty(attr)) {
      var el = $("<a></a>");
      el.attr("onClick", "loadStoryEvent('" + attr + "')");
      el.attr('class', 'sidebarLink');
      el.attr('data-event', attr);
      el.append(document.createTextNode(attr));
      sidebar.append(el);
      sidebar.append($("<br></br>"));
      Squire.eventKeyList.push(attr);
    }
  }
  $('#choiceKey_1_field').autocomplete({
    source: Squire.eventKeyList
  });
  $('#talkYes_field').autocomplete({
    source: Squire.eventKeyList
  });
  $('#talkNo_field').autocomplete({
    source: Squire.eventKeyList
  });
}

var loadStoryEvent = function(storyEvent) {
  var sEvent = Squire.storyEvents[storyEvent];
  if (typeof sEvent == "undefined") {
    emitMessage("Event error: no event: " + storyEvent);
    return;
  }

  var newType = sEvent.type;
  if (typeof newType == 'undefined' || newType == '') {
    if (typeof sEvent.next != "undefined") {
      newType = 'next';
    } else {
      if (typeof sEvent.talk != "undefined") {
        newType = 'talk';
      }
    }
  }
  Squire.elements.eventType.val(sEvent.type || 'next').trigger('change');

  Squire.elements.eventKey.val(storyEvent);
  Squire.elements.location.val(sEvent.location);
  Squire.elements.person.val(sEvent.person);
  Squire.elements.talkReaction.val(sEvent.talkReaction);
  Squire.elements.text.text(getString(sEvent.type, storyEvent));
  var prJoin = (typeof sEvent.preReqJoin == "undefined") ? "OR" : sEvent.preReqJoin;
  Squire.elements.preReqJoin.val(prJoin).trigger('change');
  var prCnt = (typeof sEvent.preReq == "undefined") ? 1 : sEvent.preReq.length;
  prCnt += (typeof sEvent.notPreReq == "undefined") ? 0 : sEvent.notPreReq.length;
  Squire.elements.preReqCount.val(prCnt);

  setChoices(storyEvent, sEvent);
  Squire.elements.choiceCount.val(sEvent.actions.length);

  //buildEventType(storyEvent.type);
  
}

var setChoices = function(storyEvent, sEvent) {
  var currentLength = Squire.elements.choiceCount.val();
  var newLength = 1;
  if (typeof sEvent.actions != "undefined") {
    newLength = sEvent.actions.length;
  }
  
  if (currentLength > newLength) {
    for(var i=newLength; i<currentLength; i++) {  
      $("#choiceBlock_" + i).remove();
    }
  }
  if (newLength > currentLength) {
    for(var i=currentLength; i<newLength; i++) {
      addChoiceFields(sEvent.actions[i], Squire.storyStrings.actions[sEvent.actions[i]]);
    }
  }

  $("#choiceKey_1_field").val(sEvent.actions[0]);
  $("#choiceText_1_field").val(Squire.storyStrings.actions[sEvent.actions[0]]);
  Squire.elements.choiceCount.val(newLength);
}

var getString = function(type, key) {
  if (type == 'talk') {
    return Squire.storyStrings.you[key];
  }
  var str = Squire.storyStrings.events[key];
  if (typeof str == "undefined") {
    str = Squire.storyStrings.actions[key];
  }
  return str;
}

var setupPersonDialog = function() {
    personDialog = $("#addPersonDialog").dialog({
      autoOpen: false,
      height: 200,
      width: 450,
      modal: true,
      buttons: {
        "Add Person": addPerson,
        Cancel: function() {
          personDialog.dialog( "close" );
        }
      },
      close: function() {
        personForm[ 0 ].reset();
        
      }
    });

    personForm = personDialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addPerson();
    });

    $( "#addPersonLink" ).on( "click", function() {
      personDialog.dialog( "open" );
    });
};

var addPerson = function() {
  personDialog.dialog( "close" );
  emitMessage("add person");
}

var setupLocationDialog = function() {
    locationDialog = $("#addLocationDialog").dialog({
      autoOpen: false,
      height: 200,
      width: 450,
      modal: true,
      buttons: {
        "Add Location": addLocation,
        Cancel: function() {
          locationDialog.dialog( "close" );
        }
      },
      close: function() {
        locationForm[ 0 ].reset();
        
      }
    });   

    locationForm = locationDialog.find( "form" ).on( "submit", function( event ) {
      event.preventDefault();
      addLocation(locationForm);
    });

    $( "#addLocationLink" ).on( "click", function() {
      locationDialog.dialog( "open" );
    });    
};

var setupMessageDialog = function() {
  messageDialog = $("#messageDialog").dialog({
      autoOpen: false,
      height: 200,
      width: 450,
      modal: true,
      buttons: {
        Close: function() {
          messageDialog.dialog( "close" );
        }
      }
    });   
}

var emitMessage = function(msg) {
  $('#messageContent').text(msg);
  messageDialog.dialog( "open" );
}

var addLocation = function(form) {
    $.ajax({
      url: "location/" + Squire.chapter,
      method: 'POST',
      dataType: 'json',
      data: {
        "key": $("#locationKey_field").val(),
        "text": $("#locationText_field").val() 
      }
    })
    .done(function(response) {
      Squire.locations.push( $("#locationKey_field").val() );
      $("#location_field").val($("#locationKey_field").val());
      locationDialog.dialog( "close" );
      //Squire.storyStrings = response;
    })
    .fail(function() {
      emitMessag("failed to add location");
    });
}


var addPreReqFields = function() {
    var ccnt = $('#preReqCount_field');
    var cntVal = parseInt(ccnt.val());
    var newVal = cntVal + 1;
   

    var ck = $("#preReqType_" + cntVal + "_field").clone().prop(
        { id: "preReqType_" + newVal + "_field", 
          name: "preReqKey_" + newVal
        }
    );
    var ct = $("#preReqThing_" + cntVal + "_field").clone().prop(
        { id: "preReqThing_" + newVal + "_field", 
          name: "preReqThing_" + newVal
        }
    );

    var lastEl = $("#preReqThing_" + cntVal + "_field");
    lastEl.after("<br>", "Type: ", ck, " ", ct);

    ccnt.val(newVal);
}

var addChoiceFields = function(ckVal, ctVal) {
    var ccnt = $('#choiceCount_field');
    var cntVal = parseInt(ccnt.val());
    var newVal = cntVal + 1;

    var ck = $("#choiceKey_" + cntVal + "_field").clone().prop(
        { id: "choiceKey_" + newVal + "_field", 
          name: "choiceKey_" + newVal,
          value: (typeof ckVal == "undefined") ? "": ckVal
        }
    );
    var ct = $("#choiceText_" + cntVal + "_field").clone().prop(
        { id: "choiceText_" + newVal + "_field", 
          name: "choiceText_" + newVal,
          value: (typeof ckVal == "undefined") ? "": ctVal
        }
    );

    
    var lastEl = $("#choiceText_" + cntVal + "_field");
    var cb = $("<span></span>");
    cb.attr('id', 'choiceBlock_' + newVal);
    cb.append("<br>", "Key: ", ck, " Text: ", ct);
    //lastEl.after("<br>", "Key: ", ck, " Text: ", ct);
    lastEl.after(cb);

    ccnt.val(newVal);

    ck.autocomplete({
      source: Squire.eventKeyList
  });
}

var addEffectsFields = function() {
    var ccnt = $('#effectsCount_field');
    var cntVal = parseInt(ccnt.val());
    var newVal = cntVal + 1;
   

    var ck = $("#effectsType_" + cntVal + "_field").clone().prop(
        { id: "effectsType_" + newVal + "_field", 
          name: "effectsKey_" + newVal
        }
    );
    var ct = $("#effectsThing_" + cntVal + "_field").clone().prop(
        { id: "effectsThing_" + newVal + "_field", 
          name: "effectsThing_" + newVal
        }
    );

    var lastEl = $("#effectsThing_" + cntVal + "_field");
    lastEl.after("<br>", "Type: ", ck, " ", ct);

    ccnt.val(newVal);
}

var changeEventType = function() {
    var dur = 350;
    var etVal = $('#eventType_field option:selected').val();
    if (etVal == "") {
        $('#preReqArea').hide(dur);
        $('#effectsArea').hide(dur);
        $('#talkArea').hide(dur);
        return;
    }
    if( etVal == "next" ) {
        $('#preReqArea').hide(dur);
        $('#effectsArea').hide(dur);
        $('#talkArea').hide(dur);
        $('#addChoiceLink').hide(dur);
    } else {
        $('#preReqArea').show(dur);
        $('#effectsArea').show(dur);
        $('#addChoiceLink').show(dur);  
        if (etVal == "talk") {
            $('#talkArea').show(dur);
        } else {
            $('#talkArea').hide(dur);
        }
    }
}

var isEmpty = function(obj) {
  for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          return false;
        }
  }

  return true;
}

