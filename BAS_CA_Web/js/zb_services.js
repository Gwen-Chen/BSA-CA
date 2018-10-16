// Service APIs to the zhibei system at http://db.zhibeifw.com:8888
define('zb_services', ['utils'], function() {
  // All requests are proxied (crossing domain ajax).
  var proxyUrl = 'php/proxy.php';
  var redirectUrl = 'php/redirect.php';
  var serviceUrl = 'zbServiceUrl';
  
  function get_proxied_url(url) {
    return proxyUrl + '?url=' + encodeURIComponent(url);
  }
  
  function fixJoinDate(user) {
    var date = new Date(user.ts);
    if (!date.getFullYear()) date = new Date();
    return '' + date.getFullYear() + '-' + (date.getMonth()+1) + 
        '-' + date.getDate();
  }

  return angular.module('ZBServicesModule', ['UtilsModule']).factory('zbrpc',
      function($http, $httpParamSerializerJQLike, $q, utils) {

    var canceller = $q.defer();
    
    function http_form_post($http, data) {
      return $http({
          method: 'POST',
          url: proxyUrl,
          data: data,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          timeout: canceller.promise
      });
    }

    function toZBUser(user) {
      utils.setCountryLabels(user);
      return {
        name: user.name,
        sn: user.internal_id,
        gender: 1 - parseInt(user.sex),
        birth_year: parseInt(user.birthyear),
        district1: user.countryLabel,
        district2: user.stateLabel + '-' + user.city,
        education: user.education + 3,
        lifelong: utils.isBitSet(user.enroll_tasks, utils.permanentIndex) ?
          1 : 0,
        job: user.occupation || '无',
        //TODO: fill 'is_fdy' in the future (is teacher (fu dao yuan))?
        is_fdy: 0,
        is_ytb: utils.isBitSet(user.enroll_tasks, utils.workshopIndex) ? 
            1 : 0,
        study_style:
            utils.isBitSet(user.enroll_tasks, utils.selfLearningIndex) ? 
                1 : 0,
        position: '',
        onlywensi: utils.isBitSet(user.enroll_tasks, utils.wensiIndex) ?
            1 : 0,
        joinDate: fixJoinDate(user),
        yy: '',
        yy_No: user.yy || '',
        level: 0
      };
    }
    
    return {
      serviceUrl: serviceUrl,
      get_secure_url: function(url) {
        return '{0}?url={1}'.format(redirectUrl, encodeURIComponent(url));
      },
      getClassUrl: function(pre_classID) {
        return this.get_secure_url('{0}/pre/classinfo?pre_classID={1}'
            .format(serviceUrl, pre_classID));
      },
      cancel: function() {
        canceller.resolve(false);
        canceller = $q.defer();
      },
      is_showing_login_form: function(html) {
        return (html || '').indexOf('<input type="password"') > 0;
      },
      is_authenticated: function() {
        var that = this;
        var url = '{0}/pre/check_edit_password_ajax?type=get_edit_permission'.
            format(serviceUrl);
        return $http.get(get_proxied_url(url)).then(function(response) {
          return parseInt(response.data.edit_permission) == 1;
        });
      },
      get_report_result_url: function(pre_classID, halfTerm) {
        var url = '{0}/pre/report?pre_classID={1}&half_term={2}'.
            format(serviceUrl, pre_classID, halfTerm);
        return this.get_secure_url(url);
      },
      get_class_info_url: function(pre_classID) {
        var url = '{0}/pre/classinfo?pre_classID={1}'.
            format(serviceUrl, pre_classID);
        return this.get_secure_url(url);
      },
      login: function(username, password, captcha) {
        var data = {
          'username': username,
          'password': password,
          'captcha': captcha,
          'url': serviceUrl + '/account/login' 
        };
        var url = ('{0}/account/login?type=login&username={1}' + 
            '&password={2}&captcha={3}').format(serviceUrl, username, 
            password, captcha);
        return $http.get(get_proxied_url(url));
      },
      edit: function(editPassword) {
        var url = ('{0}/pre/check_edit_password_ajax?type=check_edit_password' + 
            '&edit_password={1}').format(serviceUrl, editPassword);
        return $http.get(get_proxied_url(url)).then(function(response) {
          return response.data.returnValue == 'true';
        });
      },
      /// courseId: 加行：1，入行论：2，净土：3
      /// startdate: '2015-06-01'
      /// district1: '美国'
      /// localID: 1, 2, 3, ...
      search_class: function(courseId, startdate, district1, localID) {
        var url = ('{0}/pre/search_ajax?query=preClass' + 
            '&courseId={1}&startdate={2}&district1={3}&localID={4}').format(
            serviceUrl, courseId, startdate, district1, localID);
        return $http.get(get_proxied_url(url));
      },
      /// study: 1 face 2 face, 2 network.
      create_class: function(groupId, courseId, startdate, district1, localID) {
        var data = {
          url: '{0}/pre/classselect_ajax'.format(serviceUrl),
          pre_groupID: groupId,
          type: 'add_pre_class',
          district1: district1,
          district2: '',
          courseID: courseId,
          startDate: startdate,
          localID: localID,
          study_style: 2,
          note: ''
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      create_user: function(pre_classID, user) {
        var data = toZBUser(user);
        data.url = '{0}/pre/classinfo_ajax'.format(serviceUrl); 
        data.type = 'add_user';
        data.pre_classID = pre_classID;

        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      update_user: function(user) {
        var data = toZBUser(user);
        data.userID = user.zb_id;
        data.url = '{0}/user/basic_ajax'.format(serviceUrl);

        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      get_user_preclass: function(userID) {
        var url = '{0}/user/basic?userID={1}'.format(serviceUrl, userID);
        return $http.get(get_proxied_url(url)).then(function(response) {
          var html = response.data;
          var m = /var history_classes_json = (\[.+\]);/g.exec(html);
          if (!m || !m[1]) return;
          var histories = JSON.parse(m[1]);
          // The first entry of the histories list has the most updated class info.
          return utils.first(histories);
        });
      },
      list_users: function(pre_classID) {
        var url =
            '{0}/pre/classinfo_ajax?type=pre_class_user_list&pre_classID={1}'
                .format(serviceUrl, pre_classID);
        return $http.get(get_proxied_url(url));
      },
      report_schedule_task: function(type, pre_classID, userID, half_term, book,
          audio) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: type,
          half_term: half_term,
          book: book,
          audio: audio
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      report_preparation_task: function(pre_classID, userID, half_term,
          records) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: 'jxWork_grid',
          half_term: half_term
        };
        for (var key in records) {
          data[key] = records[key];
        }
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      get_preclass_lessons: function(pre_classID, courseID, half_term) {
        var url = ('{0}/pre/report_ajax?courseID={1}&half_term={2}' +
            '&type=pre_class_lessons&pre_classID={3}').format(serviceUrl,
                courseID, half_term, pre_classID);
        return $http.get(get_proxied_url(url));
      },
      report_guanxiu_task: function(pre_classID, userID, half_term,
          count, time) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: 'guanxiu_grid',
          half_term: half_term,
          count: count,
          time: time
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      report_limited_schedule_task: function(type, pre_classID, userID,
          half_term, book, audio, att, otherTasks) {
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          userID: userID,
          pre_classID: pre_classID,
          type: type,
          half_term: half_term,
          book: book,
          audio: audio,
          att: att
        };
        utils.mix_in(data, otherTasks);
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      get_root_groups: function() {
        var url = '{0}/pre/classselect_ajax?type=init_root_tree'.
            format(serviceUrl);
        return $http.get(get_proxied_url(url));
      },
      is_normal_user: function(user) {
        return parseInt(user.status) == 0;
      },
      get_scores: function(pre_classID) {
        var url = '{0}/pre/report_ajax?type=exam_grid&pre_classID={1}'.
            format(serviceUrl, pre_classID);
        return $http.get(get_proxied_url(url));
      },
      report_score: function(score) {
        function validate(score) {
          score = parseInt(score);
          return !score || score < 30 ? '不合格' : score;
        }
        var data = {
          url: '{0}/pre/report_ajax'.format(serviceUrl),
          type: 'exam_grid',
          userID: score.userID,
          pre_classID: score.pre_classID,
          exam1_open: score.exam1_open,
          exam1_score: validate(score.exam1_score),
          exam2_open: score.exam2_open,
          exam2_score: validate(score.exam2_score)
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      get_task_records: function(gridType, pre_classID, halfTerm) {
        var url = '{0}/pre/report_ajax?type={1}&pre_classID={2}&half_term={3}'.
            format(serviceUrl, gridType, pre_classID, halfTerm);
        return $http.get(get_proxied_url(url));
      },
      transfer_user: function(userID, preclassID, destinationClassID, reason) {
        var data = {
          url: '{0}/pre/classinfo_ajax'.format(serviceUrl),
          type: 'transfer_users',
          userIDs: [userID],
          pre_classID: preclassID,
          dst_pre_classID: destinationClassID,
          reason: reason
        };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      },
      recover_user: function(pre_classID, userID) {
  	    var data = {
          url: '{0}/pre/classinfo_ajax'.format(serviceUrl),
          type: 'recover_users',
          pre_classID: pre_classID,
          userIDs: [userID]    	    		
  	    };
        return http_form_post($http, $httpParamSerializerJQLike(data));
      }
    };
  });
});
