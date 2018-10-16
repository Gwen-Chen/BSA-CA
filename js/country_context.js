function getUrlParameter(name) {
  var result = null;
  var params = location.search.substr(1).split("&");
  for (var i in params) {
      var pair = params[i].split('=');
      if (pair[0] === name) return pair[1];
  }
}

function getCountryCode() {
  var country = getUrlParameter('country');
  if (country) return country.toUpperCase();

  if (location.hostname.includes('starter-ca-')) return 'CA';

  locale = navigator.language.split('-');
  if (locale[1]) return locale[1].toUpperCase();

  return 'US';
}

function adjustCountryContext() {
  var country = getCountryCode();
  if (country == 'US') return;
  
  document.title = '新学员注册';

  var outerUs = document.querySelector('.outer-us');
  outerUs.parentNode.removeChild(outerUs);

  var className = country.toLowerCase();
  document.querySelector('.register-banner').classList.add(className);

  var countrySelect = document.querySelector('#country');
  if (countrySelect) {
    countrySelect.value = country;
    countrySelect.onchange();
  }
  
  var anchors = document.querySelectorAll('a');
  anchors.forEach(function(anchor) {
    if (anchor.href.includes('/register2.html#')) {
      anchor.href = anchor.href.replace('/register2.html', 
          '/register2.html?country=' + country);
    }
  });
}

adjustCountryContext();
