var sourceUrl = 'http://www.lemonde.fr/webservice/decodex/updates';

var email = Session.getActiveUser().getEmail();
var github = 'https://github.com/lauregch/decodecodex';

var notes = {
  0 : { name : 'Collaboratif',    color : '#A2A9AE' },
  1 : { name : 'Parodique',       color : '#129AF0' },
  2 : { name : 'Très peu fiable', color : '#D50303' },
  3 : { name : 'Peu fiable',      color : '#F5A725' },
  4 : { name : 'Plutôt fiable',   color : '#468847' }
};

var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();

var dataSheet = spreadSheet.getSheetByName('Data')
if ( ! dataSheet ) {
  dataSheet = spreadSheet.getActiveSheet();
  spreadSheet.renameActiveSheet('Data');
}
var logSheet = spreadSheet.getSheetByName('Log') || spreadSheet.insertSheet('Log');

var timestamp = new Date().toLocaleString();
   
var existingData = [];
var newsLog = [];
var colors = [];

var updated = false;



function startsWith( haystack, needle ) {
  return haystack.lastIndexOf( needle, 0 ) === 0;
}

function addLog( dataArray ) {
  updated = true;
  newsLog.push( [timestamp].concat(dataArray) );
}


function fetchDecodexData() {
  
  var response = UrlFetchApp.fetch( sourceUrl ); 
  var json = JSON.parse( response.getContentText() );
  
  var data = [];  
  var indexedUrls = {};
  
  for ( var url in json.urls ) {
      
    var index = parseInt( json.urls[url], 10 );
    
    if ( startsWith(url, 'facebook.com/') ) pos = 1;
    else if ( startsWith(url, 'twitter.com/') ) pos = 2;
    else if ( startsWith(url, 'youtube.com/') ) pos = 3;
    else pos = 0;
      
    if ( ! indexedUrls.hasOwnProperty(index) ) {
      indexedUrls[ index ] = ['', '', '', ''];
    }
    indexedUrls[ index ][ pos ] = url;      
    
  }
  
  var existingCopy = JSON.parse(JSON.stringify(existingData));
  
  for ( var index in json.sites ) {
   
    if ( json.sites.hasOwnProperty(index) ) {
      
      if ( indexedUrls.hasOwnProperty(index) ) {
        
        var site = json.sites[ index ];

        var urls = indexedUrls[ index ];    
        var note = notes[ site[0] ].name;
        var desc = site[1];
        var name = site[2];
                
        data.push( urls.concat([ name, note, desc ]) );
        colors[ data.length ] = notes[ site[0] ].color;
        
        var found = existingData.some( function(ex, i) {

          if ( ex[0] && ex[0]==urls[0] || ex[1] && ex[1]==urls[1] || ex[2] && ex[2]==urls[2] || ex[3] && ex[3]==urls[3] ) {
            
            var existingNote = ex[5];
            var existingDesc = ex[6];
            
            if ( existingNote != note ) {
              addLog([ name, 'Note modifiée', note, '', existingNote, '' ]);
            }
            if ( existingDesc != desc ) {
              addLog([ name, 'Description modifiée', '', desc, '', existingDesc ]);
            }
            
            return i+1;
            
          }
          
        });
        
        if ( ! found && existingData.length ) {
          addLog([ name, 'Site ajouté', note, desc, '', '' ]);
        }
        else {
          existingCopy.splice( found-1, 1 );
        }
        
      }
      else {
        Logger.log( 'missing index in decodex : '+ index );
      }
      
    }
 
  }
  
  existingCopy.forEach( function(missing) {
    
    if ( missing[4] ) {
      addLog([ missing[4], 'Site retiré', '', '', missing[5], missing[6] ]);
    }
    
  });
  
  return data;
    
}


function prettify() {
  
  if ( dataSheet.getLastRow() ) {
    colors.forEach( function(color, i) {
      dataSheet.getRange( dataSheet.getFrozenRows()+i, 6, 1, 1 ).setBackground( color );
    });
    dataSheet.sort(5);
    dataSheet.getRange( dataSheet.getFrozenRows()+1, 1, dataSheet.getLastRow(), dataSheet.getLastColumn() ).setFontSize('9').setVerticalAlignment('middle');
    dataSheet.getRange( dataSheet.getFrozenRows()+1, 1, dataSheet.getLastRow(), 4 ).setFontSize('7');
    dataSheet.getRange( dataSheet.getFrozenRows()+1, 5, dataSheet.getLastRow() ).setFontWeight('bold');
    dataSheet.getRange( 1, 1, dataSheet.getFrozenRows(), 2 ).setFontWeight('bold');
  }
  
  if ( logSheet.getLastRow() ) {
    logSheet.getRange( 1, 1, 1, 7 ).setFontWeight('bold');
    logSheet.getRange( 1, 1, logSheet.getLastRow(), logSheet.getLastColumn() ).setFontSize('9').setVerticalAlignment('middle');
    logSheet.getRange( 1, 1, logSheet.getLastRow(), 2 ).setFontWeight('bold');
    logSheet.getRange( 2, 5, logSheet.getLastRow(), 1 ).setWrap(true);
    logSheet.getRange( 2, 7, logSheet.getLastRow(), 1 ).setWrap(true);
  }
  
}

  
function __main() {
  
  if ( dataSheet.getLastRow() ) {
    existingData = dataSheet.getRange( dataSheet.getFrozenRows()+1, 1, dataSheet.getLastRow(), dataSheet.getLastColumn() ).getValues();
  }
  var lastUpdate = dataSheet.getRange('B2').getValue();
  
  var newdata = fetchDecodexData();
  dataSheet.clear();
  dataSheet.getRange('A1:B1').setValues([['Last refresh', timestamp]]);
  dataSheet.getRange('A2').setValue('Last update');
  dataSheet.getRange('B2').setValue( lastUpdate );
  dataSheet.getRange('A3:B3').setValues([['Source code', github]]);
  dataSheet.setFrozenRows(3);
  dataSheet.getRange( dataSheet.getFrozenRows()+1, 1, newdata.length, newdata[0].length ).setValues( newdata );
  
  logSheet.setFrozenRows(1);
  if ( ! newsLog.length ) {
    var logHeader = [ '', '', '', 'Note', 'Description', 'Ancienne note', 'Ancienne description' ];
    logSheet.getRange( 1, 1, 1, logHeader.length ).setValues( [logHeader] );
  }
  else {
    logSheet.getRange( logSheet.getLastRow()+1, 1, newsLog.length, newsLog[0].length ).setValues( newsLog );
    if ( email ) {
      MailApp.sendEmail( email, 'Decodecodex has changed', SpreadsheetApp.getActiveSpreadsheet().getUrl() );
    }
  }
  
  if ( updated ) {
    dataSheet.getRange('B2').setValue(timestamp);
  }
  
  prettify();
  
}