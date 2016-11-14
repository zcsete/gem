import { urlShare } from './UrlShare';
import { storageService } from './StorageService';

class DataOperation {
  constructor() {
    this.inputState = {
      url: '',
      appname: '',
      version: '2.4.0',
      selectedType: []
    };
    this.mappingData = null;
    this.settings = null;
    this.defaultApp1 = {
      appname: '2016primaries',
      url: 'https://Uy82NeW8e:c7d02cce-94cc-4b60-9b17-7e7325195851@scalr.api.appbase.io',
      selectedType: []
    };
    this.defaultApp = {
      url: 'https://VV3IsiOap:f937dbed-9b5d-4fc2-9ce8-55f2f495d1a5@scalr.api.appbase.io',
      appname: 'heatmap-sample'
    };
  }
  // Get input stats from url
  getInputState() {
    this.queryParams = this.getQueryParameters();
    urlShare.queryParams = this.queryParams;
    return new Promise((resolve, reject) => {
      let config = null;
      let isDefault = window.location.href.indexOf('#?default=true') > -1 ? true : false;
      let isInputState = window.location.href.indexOf('input_state=') > -1 ? true : false;
      if(isDefault) {
        this.updateInputState(this.defaultApp);
        resolve(this.defaultApp);
      } else if(!isInputState) {
        reject('learn');
      }
      else {
        urlShare.decryptUrl(this.queryParams).then((data) => {
          var decryptedData = data.data;
          if(decryptedData) {
            this.updateInputState(decryptedData);
            resolve(decryptedData);
          } else {
            reject(null);
          }
        }).catch((error) => console.log(error));
      }
    });
  }
  getQueryParameters(str) {
    let hash = window.location.hash.split('#');
    if(hash.length > 1) {
      return (str || hash[1]).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
    } else {
      return null;
    }
  }
  //Get config from localstorage 
  getLocalConfig() {
    var url = storageService.get('gem-url');
    var appname = storageService.get('gem-appname');
    let appsList = this.getAppsList();
    return {
      appsList: appsList,
      url: url,
      appname: appname
    };
  }
  // get appsList from storage
  getAppsList() {
    var appsList = storageService.get('gem-appsList');
    if(appsList) {
      try {
        appsList = JSON.parse(appsList);
      } catch(e) {
        appsList = [];
      }
    } else {
      appsList = [];
    }
    return appsList;
  }
  // updateInputState
  updateInputState(inputState, changeUrl=true) {
    this.inputState = inputState;
    // update everything only after successful mapping
    if(this.mappingData) {
      storageService.set('gem-appname', inputState.appname);
      storageService.set('gem-url', inputState.url);
      urlShare.setInputs(inputState, changeUrl);
    }
  }
  // update mapping state
  updateMappingState(mappingData) {
    this.mappingData = mappingData;
    this.updateInputState(this.inputState)
  }
  // update settings state
  updateSettingState(settingsData) {
    this.settings = settingsData;
  }
  // get version
  getVersion() {
    let requestConfig = this.requestConfig = this.filterurl(this.inputState.url); 
    let url = this.requestConfig.url;
    return $.ajax({
      type: 'GET',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: url,
      xhrFields: {
        withCredentials: true
      }
    });
  }
  // get mapping
  getMapping() {
    let requestConfig = this.requestConfig = this.filterurl(this.inputState.url); 
    let url = this.requestConfig.url + '/' + this.inputState.appname + '/_mapping';
    return $.ajax({
      type: 'GET',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: url,
      xhrFields: {
        withCredentials: true
      }
    });
  }
  // update mapping
  updateMapping(request, type) {
    let requestConfig  = this.filterurl(this.inputState.url);
    let url = this.requestConfig.url + '/' + this.inputState.appname+ '/_mapping/'+type;
    return $.ajax({
      type: 'PUT',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(request),
      xhrFields: {
        withCredentials: true
      }
    });
  }
  // get settings
  getSettings() {
    let requestConfig  = this.filterurl(this.inputState.url);
    let url = requestConfig.url + '/' + this.inputState.appname+ '/_settings';
    return $.ajax({
      type: 'GET',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      }
    });
  }
  // get indices
  getIndices(url) {
    let requestConfig  = this.filterurl(url);
    let finalurl = requestConfig.url + '/_stats/indices';
    return $.ajax({
      type: 'GET',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: finalurl,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      }
    });
  }
  // update settings
  updateSettings(request) {
    let requestConfig  = this.filterurl(this.inputState.url);
    let url = requestConfig.url + '/' + this.inputState.appname+ '/_settings';
    return $.ajax({
      type: 'PUT',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(request),
      xhrFields: {
        withCredentials: true
      }
    });
  }
  // oc index
  ocIndex(type) {
    let requestConfig  = this.filterurl(this.inputState.url);
    let url = requestConfig.url + '/' + this.inputState.appname+ '/'+type;
    return $.ajax({
      type: 'POST',
      beforeSend: function(request) {
        request.setRequestHeader('Authorization', 'Basic ' + btoa(requestConfig.username + ':' + requestConfig.password));
      },
      url: url,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      xhrFields: {
        withCredentials: true
      }
    });
  }
  filterurl(url) {
      if (url) {
          var obj = {
              username: 'test',
              password: 'test',
              url: url
          };
          var urlsplit = url.split(':');
          try {
              obj.username = urlsplit[1].replace('//', '');
              var httpPrefix = url.split('://');
              if(urlsplit[2]) {
                  var pwsplit = urlsplit[2].split('@');
                  obj.password = pwsplit[0];
                  if(url.indexOf('@') !== -1) {
                      obj.url = httpPrefix[0] + '://' + pwsplit[1];
                      if(urlsplit[3]) {
                          obj.url += ':'+urlsplit[3];
                      }
                  }
              }
          } catch(e) {
              console.log(e);
          }
          return obj;
      } else {
          return null;
      }
    }

}

export const dataOperation = new DataOperation();