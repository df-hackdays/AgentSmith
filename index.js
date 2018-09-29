const express = require('express');
const fetch = require('node-fetch')

var http = require("http");
var path = require('path');
const app = express();
app.use(express.static('public'))
app.set('view engine', 'pug')
const port = 3000;


const LinkedIn = {
  login: () => {
    let baseurl = "https://www.linkedin.com/oauth/v2/authorization?";
    return baseurl+LinkedIn.loginQueryParams();
  },
  loginQueryParams: () => {
    return "response_type=code&client_id=78npdeewvfhftw&redirect_uri=http://localhost:3000/aftersignin&state=987654321&scope=r_basicprofile";
  },
  accessTokenRequest: (postbody) =>{
    return {
      method: 'post',
      body: postbody,
      headers:{"Content-Type": "application/x-www-form-urlencoded"}
    }
  },
  fetchProfileUrl: () => {
    let urlv1 = "https://api.linkedin.com/v1/people/~?format=json";
    let urlv2 ="https://api.linkedin.com/v2/me";
    return urlv1;
  },
  apiHeader: (at) => {
    return {
      'Authorization': 'Bearer '+at
    }
  },
  fetchProfile: (code) => {
    let accessTokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
    let postbody = "grant_type=authorization_code&code="+code+"&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Faftersignin&client_id=78npdeewvfhftw&client_secret=DRGfCihlossHfi4E";

    let p = new Promise((resolve,reject) =>{
      fetch(accessTokenUrl, LinkedIn.accessTokenRequest(postbody))
      .then(r => r.text())
      .then(body => {
        var data = JSON.parse(body);
        var at = data.access_token;
        console.log("--");
        console.log(at);
        console.log("+++");
        return fetch(LinkedIn.fetchProfileUrl(), {
          method: 'get',
          headers: LinkedIn.apiHeader(at)
        })
      })
      .then(r => r.text())
      .then(body => {
        var data = JSON.parse(body);
        resolve(data);
      })
      .catch(e=>{
        reject(e);
      })
    });

    return p;
  },
  getFakeLocation: (id) => {

    let location = {
      countryCode = "ca",
      postalCode = "12345",
      standardizedLocationUrn = "urn:li:standardizedLocationKey:(ca,12345)"
    }

    switch(id){
      case '123':
        return location;
      default:
        return location;
    }
  }
  getFullProfile: (profile) =>{
    let new_profile = {...sample_profile};
    new_profile.id = profile.id;
    new_profile.firstName = profile.firstName;
    new_profile.lastName = profile.lastName;
    new_profile.headline = profile.headline;
    new_profile.location = LinkedIn.getFakeLocation(profile.id);

    return new_profile;
  }
}


const sample_profile = {
  "id": "yrZCpj2Z12",
  "firstName": {
    "localized": {
      "en_US": "Bob"
    },
    "preferredLocale": {
      "country": "US",
      "language": "en"
    }
  },
  "lastName": {
    "localized": {
      "en_US": "Smith"
    },
    "preferredLocale": {
      "country": "US",
      "language": "en"
    }
  },
  "location": {
    "countryCode": "us",
    "postalCode": "94101",
    "standardizedLocationUrn": "urn:li:standardizedLocationKey:(us,94101)"
  },
  "positions": {
    "660879450": {
      "companyName": {
        "localized": {
          "en_US": "LinkedIn"
        },
        "preferredLocale": {
          "country": "US",
          "language": "en"
        }
      },
      "id": 660879450,
      "title": {
        "localized": {
          "en_US": "Staff Software Engineer"
        },
        "preferredLocale": {
          "country": "US",
          "language": "en"
        }
      }
    }
  },
  "headline": {
    "localized": {
      "en_US": "API Enthusiast at LinkedIn"
    },
    "preferredLocale": {
      "country": "US",
      "language": "en"
    }
  }
}








app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/login', (req,res) => {
  res.redirect(LinkedIn.login());
});



app.get('/aftersignin', (req,res) => {

  let code = req.query.code;

  if(code){

    LinkedIn.fetchProfile(code)
    .then((profile)=>{
      res.render('aftersignin',{profile:LinkedIn.getFullProfile(profile)});
    })
    .catch(error=>{
      res.render('error',{error:error})
    });
  }

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
