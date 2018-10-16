define('importers', ['permission', 'services', 'utils'], function() {
  var delimiter = '\t';

  var lineReader = function(text, skipHeader) {
    var lines = text.split(/[\r\n]+/g);
    var index = skipHeader ? 1 : 0;
    return {
      columns: lines[0].split(delimiter),
      next: function() {
        return lines[index++];
      },
      lines: lines.length
    };
  };

  function encode_utf8(s) {
    return unescape(encodeURIComponent(s));
  }
  
  var columnMap = {
    "table": "users",
    "columns": {
      "年別": "start_year",
      "届别": "start_year",
      "start_year": "start_year",
      "学号": "internal_id",
      "序号": "internal_id",
      "internal_id": "internal_id",
      "姓名": "name",
      "您的姓名": "name",
      "name": "name",
      "法名": "nickname",
      "性别": "sex",
      "sex": "sex",
      "出生年份": "birthyear",
      "birthyear": "birthyear",
      "文化程度": "education",
      "您的学历": "education",
      "education": "education",
      "职业": "occupation",
      "occupation": "occupation",
      "班级": "classId",
      "预选班级": "classId",
      "classId": "classId",
      "联系电话": "phone",
      "您的电话": "phone",
      "phone": "phone",
      "电子邮箱或QQ号": "email",
      "email": "email",
      "您的邮箱": "email",
      "居住省份/直辖市": "state",
      "您所在省": "state",
      "state": "state",
      "市/县/区": "city",
      "您所在市": "city",
      "city": "city",
      "Status": "comments",
      "comments": "comments",
      "nickname": "nickname",
      "country": "country",
      "im": "im",
      "permission": "permission"
    },
    "sex": {
      "男": 1,
      "女": 0,
      "default": 0
    },
    "education": {
      "初中或初中以下": 1,
      "College": 3,
      "Master": 4,
      "undergraduate": 3,
      "专科": 2,
      "中专": 1,
      "初中": 1,
      "博士": 5,
      "大专": 2,
      "大学": 3,
      "大學": 3,
      "大專": 2,
      "大本": 3,
      "小学": 1,
      "教师": 3,
      "本科": 3,
      "硕士": 4,
      "碩士": 4,
      "高中": 2,
      "研究所": 4,
      "研究生": 4,
      "会计大专": 2,
      "大学本科": 3,
      "大學畢業": 3,
      "初中及以下": 1,
      "硕士及以上": 4,
      "硕研": 4,
      "硕士毕业": 4,
      "本科（在读）": 3,
      "博士（经济学）": 5,
      "学士": 3,
      "default": 1
    }
  };

  return angular.module('ImportersModule', ['PermissionModule',
      'ServicesModule', 'UtilsModule'])
      .factory('importers', function(perm, rpc, utils, $q) {

    var validate = function(user, classes) {
      var extractFromPatter = function(pattern, value) {
        var match = pattern.exec(value);
        return (match && match[1]) || '';
      };
      
      var cutOff = function(value, len) {
        return value; // && value.substring(0, len);
      };

      user.name = cutOff(user.name, 16);
      if (!user.name) return false;
      
      user.email = extractFromPatter(
          /(\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+)/, user.email).trim();
      if (!user.email) return false;
      
      user.email = user.email.toLowerCase();
      
      user.occupation = cutOff(user.occupation, 16);

      user.classId_label = user.classId && user.classId.trim();
      if (!user.classId_label) {
        user.classId = 1;
      } else {
        var classLabel = parseInt(user.classId_label.substring(0, 4)) ?
            user.classId_label : user.start_year + user.classId_label; 

        var classInfo = utils.firstElement(classes,
            'name', classLabel);
        user.classId = (classInfo && classInfo.id) || 0;
      }
      
      ['sex', 'education'].forEach(function(key) {
        var label = (user[key] && user[key].trim()) || 'default';
        user[key + '_label'] = label;
        user[key] = columnMap[key][label];
      });
      
      var start_year_label =
          (user.start_year && user.start_year.trim()) || '';
      user.start_year_label = start_year_label;
      if (start_year_label.startsWith('1')) {
        user.start_year = 2000 + parseInt(start_year_label.substring(0,2));
      } else if (start_year_label.startsWith('2')) {
        user.start_year = parseInt(start_year_label.substring(0,4));
      }
      
      user.phone = cutOff(user.phone, 16);
      var countryIndex = window.countryData.countries.indexOf(user.country);
      if (countryIndex > 0) {
        user.country = window.countryData.getCountryCode(countryIndex);
        var states = window.countryData.getStates(countryIndex);
        user.state = window.countryData.states.indexOf(user.state);
      }
       
      user.city = cutOff(user.city, 16);
      if (encode_utf8(user.city).length > 32) {
        user.city = cutOff(user.city, 8);
      }

      return true;
    };

    return {
      userImporter: {
        analyze: function(text, progress, scope) {

          return rpc.get_classes().then(function(response) {
            var reader = lineReader(text, true);
            var headerToColumn = function(header) {
              var column = columnMap.columns[header];
              if (column) {
                return column;
              }
              for (var key in columnMap.columns) {
                if (header.indexOf(key) >= 0) {
                  return columnMap.columns[key];
                }
              }
              
              return header;
            };
            var result = {
              headers: reader.columns,
              columns: utils.map(reader.columns, headerToColumn),
              records: [],
              skipped: []
            };
            
            var removeQuations = function(value) {
              return value.replace(/"(.*)"/, '$1');
            };
            
            var index = 1;
            var recordsMap = {};
            var next = function() {
              var line = reader.next();
              if (!line) {
                setTimeout(function() {
                  progress && progress(++index, reader.lines, null, result);
                  scope.$apply();
                }, 0);
                return;
              }
              
              var user = {};
              var columnValues = line.split(delimiter);
              for (var c = 0; c < reader.columns.length; c++) {
                user[result.columns[c]] =
                    removeQuations(columnValues[c]).trim();
                if (result.headers[c].indexOf('年龄') >= 0) {
                  var year = (new Date()).getFullYear() -
                      parseInt(columnValues[c], 10);
                  user.birthyear = '' + year;
                }
              }
              
              if (validate(user, response.data) && !recordsMap[user.email]) {
                result.records.push(user);
                recordsMap[user.email] = true;
              } else if (user.name) {
                result.skipped.push(line);
              }

              if (progress && !progress(++index, reader.lines, null, result)) {
                return;
              }
              
              /// Yield every 10 records to update UI.
              index % 10 == 0 ? setTimeout(function() {
                scope.$apply();
                next();
              }, 0) : next();
            };
            
            next();
          });
        },
        
        diff: function(users, callback) {
          var idx = 0;
          
          var next = function() {
            var user = users[idx++];
            if (!user) return;

            rpc.get_user(user.email).then(function(existingUser) {
              if (!existingUser || !existingUser.email) existingUser = null;
              if (existingUser) {
                var ignored = ['classInfo', 'password', 'permission',
                    'internal_id', 'occupation', 'phone', 'state',
                    'city', 'name', 'education'];
                ignored.forEach(function(key) {delete existingUser[key];});

                user.id = existingUser.id;
                user.birthyear = user.birthyear || existingUser.birthyear;
                user.classId = user.classId || existingUser.classId;
                utils.diff(existingUser, user);
              } else {
                user.id = 0;
                user.changed = true;
              }

              if (user.changed) {
                user.checked = true;
              }
              
              callback && callback(idx, null, user);
              next();
            });
          };
          
          next();
        },
        
        submit: function(users, callback) {
          var idx = 0;
          
          var next = function() {
            var user = users[idx++];
            if (!user) return;
            if (!user.changed || !user.checked) {
              setTimeout(next, 0);
              return;
            }
            
            var update = {id: user.id};
            if (user.oldData) {
              for (var key in user.oldData) {
                update[key] = user[key];
              }
            } else {
              for (var key in columnMap.columns) {
                var column = columnMap.columns[key];
                update[column] = user[column];
              }
            }
            
            if (!user.classId){
              update.classId_label = user.classId_label;
              update.start_year_label = user.start_year_label;
            }

            var then = function(response) {
              user.submitted = (1 == response.data.updated);
              user.error = response.data.error;

              callback(idx, null, user);
              next();
            };
            
            rpc.update_user(update).then(then);
          };
          
          next();
        },
        
        /// Returns a Promise that is resolved when all users are exported.
        exportUsers: function(users, dataUrl) {
          var serialNumber = 0;
          var labels = [
            '序号',
            '姓名',
            '性别',
            '出生年月日',
            '文化程度',
            '职业',
            '预选专业',
            '联系电话',
            '电子邮箱',
            '省/直辖市',
            '市/县/区',
            '街道',
            '个人特长',
            '是否看过招生简章',
            '能否遵守管理规定',
            '是否皈依',
            '皈依年份',
            '知道学会的渠道',
            '备注',
            '自学',
            '只闻思',
            '研讨班',
            '终身学员',
            '班级',
            '学号',
            '法名',
            '微信',
            'YY',
            '是否愿意发心工作',
            '注册时间'
          ];
          var exportUser = function(user, className) {
            utils.setCountryLabels(user);
            return '' + (++serialNumber) + delimiter + 
              user.name + delimiter +
              utils.getDisplayLabel(user, 'sex') + delimiter +
              (user.birthyear || '') + delimiter +
              utils.getDisplayLabel(user, 'education') + delimiter +
              (user.occupation || '') + delimiter +
              delimiter +
              (user.phone || '') + delimiter +
              user.email + delimiter +
              (user.countryLabel || '') + '/' + (user.stateLabel) + delimiter +
              (user.city || '') + delimiter +
              delimiter +
              (user.skills || '') + delimiter +
              '是' + delimiter +
              '是' + delimiter +
              (user.conversion ? '是' : '否') + delimiter +
              (user.conversion || '') + delimiter +
              utils.getDisplayLabel(user, 'channel') + delimiter +
              (user.comments || '') + delimiter +
              delimiter +
              delimiter +
              (utils.isBitSet(user.enroll_tasks, 
                  utils.workshopIndex) ? '是' : '') + delimiter + 
              (utils.isBitSet(user.enroll_tasks, 
                  utils.permanentIndex) ? '是' : '') + delimiter + 
              className + delimiter +
              (user.internal_id || '') + delimiter +
              (user.nickname || '') + delimiter +
              (user.im || '') + delimiter +
              (user.yy || '') + delimiter +
              utils.getDisplayLabel(user, 'volunteer') + delimiter +
              user.ts
          };
          var createDataUrl = function(data, file) {
            data = new Blob([data], {type: 'text/plain'});
            if (file) window.URL.revokeObjectURL(file);
            return file = window.URL.createObjectURL(data);
          };
          
          var classMap = {};
          utils.forEach(users, function(user) {
            var classInfo = classMap[user.classId];
            if (!classInfo) {
              classInfo = {id: user.classId, users: []};
              classMap[user.classId] = classInfo;
            }
            classInfo.users.push(user);
          });
          var classPromises = utils.map(classMap, function(classInfo) {
            return rpc.get_classes(classInfo.id).then(function(response) {
              classInfo.name = response.data[classInfo.id].name;
              return classInfo;
            });
          });
          
          var result = '\uFEFF' + labels.join(delimiter) + '\n';
          return $q.all(classPromises).then(function(classes) {
            classes.forEach(function(classInfo) {
              classInfo.users.forEach(function(user) {
                result += exportUser(user, classInfo.name) + '\n';
              });
            });
            return createDataUrl(result, dataUrl);
          });
        }
      }
    };
  });
});
