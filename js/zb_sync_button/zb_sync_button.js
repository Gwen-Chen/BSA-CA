define('zb_sync_button/zb_sync_button',
    ['progress_bar/progress_bar', 'services', 'utils',
     'zb_services'], function() {
  var JIA_XING = 3;
  var JINGTU_DEPARTMENT = 4;

  var MAIN_GRID = 0;
  var WORK_GRID = 1;
  var ATT_LIMIT_GRID = 2;
  var GUANXIU_GRID = 3;
  var MAIN_COURSE_GRID_NAME = 'main_course_grid';
  var ATT_LIMIT_GRID_NAME = 'att_limit_grid';
  return angular.module('ZBSyncButtonModule', ['ProgressBarModule',
      'ServicesModule', 'UtilsModule', 'ZBServicesModule'])
      .directive('zbSyncButton', function($q, $rootScope, rpc, utils, zbrpc) {
      return {
        scope: {
          classId: '=',
          scheduleGroup: '=',
          task: '=',
          type: '@',
          users: '=',
        },
        link: function(scope) {
          scope.$watch('classId', function() {
            if (!scope.classId) return;
            rpc.get_classes(scope.classId).then(function(response) {
              scope.classInfo = response.data[scope.classId];
              if (!scope.classInfo) return;

              if (scope.type == 'schedule_task') {
                var halfTerm = scope.getHalfTerms().length - 1;
                scope.zbUrl = zbrpc.get_report_result_url(scope.classInfo.zb_id,
                    scope.scheduleGroup ? 
                        scope.scheduleGroup.term * 2 + halfTerm : '');
              } else {
                scope.zbUrl = zbrpc.get_class_info_url(scope.classInfo.zb_id);
              }
            });
          });
          /// Initializes an empty map to store stats for various tasks, for
          /// each user in scope.users.
          function initTaskStats() {
            utils.forEach(scope.users, function(user) {
              user.taskStats = {};
            });
            return utils.truePromise();
          }
          scope.sync = function() {
            if (scope.inprogress) return;
            scope.inprogress = true;

            var done = function() {
              scope.inprogress = false;
              if (scope.errors.length) {
                alert(scope.errors.join('\n'));
              }
            };
            scope.errors = [];
            switch (scope.type) {
            case 'schedule_task':
              var half_terms = scope.getHalfTerms();
              if (!half_terms.length) {
                alert("还没到报数时间，请检查学修安排");
              }
              var requests = [scope.ensure_authenticated];
              requests = requests.concat(half_terms.map(function(half_term) {
                return function() {
                  scope.half_term = half_term;
                  switch (scope.classInfo.department_id) {
                  case JIA_XING: 
                    return utils.requestOneByOne([
                      initTaskStats,
                      scope.getZBTaskStats(WORK_GRID),
                      scope.getZBScheduleTaskStats(MAIN_COURSE_GRID_NAME),
                      scope.getZBScheduleTaskStats(ATT_LIMIT_GRID_NAME),
                      scope.report_attendance,
                      scope.report_schedule_task,
                      scope.report_jx_task,
                      scope.report_guanxiu_task
                    ]);
                    break;
                  default:
                    return utils.requestOneByOne([
                      initTaskStats,
                      scope.getZBTaskStats(ATT_LIMIT_GRID),
                      scope.getZBScheduleTaskStats(MAIN_COURSE_GRID_NAME),
                      scope.getZBScheduleTaskStats(ATT_LIMIT_GRID_NAME),
                      scope.report_attendance,
                      scope.report_schedule_task,
                    ]);
                    break;
                  };
                };
              }));
              utils.requestOneByOne(requests).then(done);
              break;
            case 'class':
              utils.requestOneByOne([
                  scope.check_serial_numbers,
                  scope.ensure_authenticated,
                  scope.sync_class
              ]).then(done);
              break;
            case 'score':
              utils.requestOneByOne([
                  scope.ensure_authenticated,
                  scope.fetch_zb_scores,
                  scope.fetch_scores,
                  scope.update_scores,
                  scope.update_zb_scores
              ]).then(done);
              break;
            case 'tasks':
                utils.requestOneByOne([
                    scope.ensure_authenticated,
                    getLocalTasks,
                    getZbTaskReportTerms,
                    updateTaskArranges,
                ]).then(done);
                break;
            }
          };
          scope.getCourseRecord = function(user, course_id, audio, book) {
            if (!parseInt(course_id)) return;

            var record = user.records[course_id];
            audio.push((record && record.video) ? 1 : 0);
            book.push((record && record.text) ? 1 : 0);
          };
          
          scope.getBookAudioRecords = function(lessons, user, limited) {
            var group = scope.scheduleGroup;
            var audio = [];
            var book = [];

            if (limited) {
              utils.forEach(group.limited_courses, function(course) {
                scope.getCourseRecord(user, course.id, audio, book);
              });
            } else {
              utils.forEach(group.schedules, function(schedule) {
                if (!parseInt(schedule.course_id)) return;

                scope.getCourseRecord(user, schedule.course_id, audio, book);
                scope.getCourseRecord(user, schedule.course_id2, audio, book);
              });
            }

            function hasRecord(entry) { return entry; }

            if (!parseInt(user.zb_id)) {
              alert('{0}: 智悲系统中没有这个学员，请先同步学员列表。'.format(user.name));
            }
            var zbRecords = scope.zbScheduleStats[user.zb_id] || {
              limit: {audio: [], book: []},
              main: {audio: [], book: []}
            };
            var zbBookAudio = limited ? zbRecords.limit : zbRecords.main;
            var reported = utils.any(audio, hasRecord) || 
                utils.any(book, hasRecord);
            // Do not overwrite server records if user has no report at all
            // (transferred students).
            if (!reported) {
              return {
                audio: zbBookAudio.audio,
                book: zbBookAudio.book
              };
            }

            var schedules = zbBookAudio.audio.length;
            audio = (scope.half_term % 2) == 0 ? audio.slice(0, schedules) :
                audio.slice(audio.length - schedules);
            book = (scope.half_term % 2) == 0 ? book.slice(0, schedules) :
                book.slice(book.length - schedules);

            return {
              audio: audio,
              book: book
            };
          };
          
          scope.get_attendance = function(user) {
            var group = scope.scheduleGroup;
            var atts = [];

            for (var id in group.schedules) {
              var schedule = group.schedules[id];
              if (!parseInt(schedule.course_id)) continue;

              var record = user.records[schedule.course_id];
              atts.push(record && record.attended == 1 ? 1 : 0);
            }
            
            var schedules = scope.lessons.length;
            var firstHalf = scope.half_term % 2 == 0 ?
                schedules : atts.length - schedules;
            var first = 0;
            var second = 0;
            for (var index = 0; index < atts.length; index++) {
              if (index < firstHalf) first += atts[index];
              else second += atts[index];
            }
            return [first, second];
          };

          scope.getEndTerm = function() {
            return utils.getEndTime(scope.scheduleGroup);
          };
          
          // Determine which half terms to report, based on current time.
          scope.getHalfTerms = function() {
            var now = utils.unixTimestamp(new Date());
            var midTerm = utils.getMidTerm(scope.scheduleGroup);

            // Before middle of the current term, nothing to report yet.
            if (now < midTerm) return [];

            var endTerm = scope.getEndTerm();
            
            var half_term_base = scope.scheduleGroup.term * 2;
            // Between mid-term and the end of the term, report the first half.
            if (midTerm <= now && now < endTerm) {
              return [half_term_base];
            }
            
            // Report both the first and the second half terms.
            return [half_term_base, half_term_base + 1];
          };
          scope.report_schedule_task = function() {
            var taskKey = '传承';
            var users = scope.users;

            var requests = [];
            scope.totalTasks = 0;
            scope.finished = 0;

            var lessons = scope.lessons;
            utils.forEach(users, function(user) {
              if (scope.checkUserTask(user, taskKey)) return;

              var records = scope.getBookAudioRecords(lessons, user);
              var request = function() {
                scope.statusText = '正在为"{0}"提交{1}半学期听传承和读法本记录...'.
                    format(user.name, ['上', '下'][scope.half_term % 2]);
                return zbrpc.report_schedule_task(
                    scope.get_report_type(MAIN_GRID),
                    scope.classInfo.zb_id, parseInt(user.zb_id),
                    scope.half_term, records.book,
                    records.audio).then(function(response) {
                      scope.finished++;
                      return scope.checkResponse(response, user, taskKey);
                    });
              };
              requests.push(request);
            });
            scope.totalTasks = requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.checkResponse = function(response, user, task) {
            var success = response.data &&
                (response.data.returnValue == 'success');
            if (success) {
              var userResult = scope.results[user.id]; 
              if (!userResult) userResult = [];
              var result = userResult[scope.half_term % 2] || {};
              result[task] = true;
              userResult[scope.half_term % 2] = result;
              scope.results[user.id] = userResult;
            } else {
              scope.errors.push(
                  '学员"{0}"的"{1}"记录未能成功提交，请重试'.format(user.name, task));
            }
            return true; 
          };
          scope.checkUserTask = function(user, task) {
            return scope.results[user.id] &&
                scope.results[user.id][scope.half_term % 2] &&
                scope.results[user.id][scope.half_term % 2][task];
          };
          scope.ensure_authenticated = function() {
            scope.finished = 0;
            scope.totalTasks = 1;

            scope.statusText = '正在检查是否登录并具有编辑权限...';
            return zbrpc.is_authenticated().then(function(authenticated) {
              scope.finished++;
              return authenticated || scope.showLoginDialog();
            });
          };
          scope.showLoginDialog = function() {
            scope.username = 'zhibeihw1';
            document.querySelector('#zb-login').open();
            scope.deferredLogin = $q.defer();
            return scope.deferredLogin.promise;
          };
          scope.$on('zb-login-confirmed', function(event, credential) {
            if (!scope.deferredLogin) return;

            if (credential) {
              var username = credential.username;
              var password = credential.password;
              var editPassword = credential.editPassword;
              var captcha = credential.captcha;
  
              scope.finished = 0;
              scope.totalTasks = 1;
  
              scope.statusText = '正在登录...';
              zbrpc.login(username, password, captcha).then(function(response) {
                var success = response.data &&
                    (response.data.returnValue == 'true');
                if (!success) {
                  scope.finished++;
                  alert('登录失败');
                  scope.deferredLogin.resolve(false);
                } else {
                  zbrpc.edit(editPassword).then(function(approved) {
                    scope.finished++;
                    scope.deferredLogin.resolve(approved);
                  });
                }
              });
            } else {
              scope.deferredLogin.resolve(false);
            }
          });

          scope.report_jx_task_for_user = function(user) {
            var taskKey = '加行';

            if (scope.checkUserTask(user, taskKey) ||
                utils.isEmpty(user.taskStats)) {
              return utils.truePromise();
            }

            scope.statusText = '正在为"{0}"提交{1}半学期"{2}"任务记录...'.format(
                user.name, ['上', '下'][scope.half_term % 2], taskKey);
            return zbrpc.report_preparation_task(scope.classInfo.zb_id,
                user.zb_id, scope.half_term,
                user.taskStats).then(function(response) {
                  scope.finished++;
                  return scope.checkResponse(response, user, taskKey);
                });
          };

          scope.getTaskSubIndexes = function() {
            return zbrpc.get_preclass_lessons(scope.classInfo.zb_id,
                scope.guanxiuTask.zb_course_id, scope.half_term)
                .then(function(response) {
                  var data = response.data.data;
                  var indexes = (data || []).map(function(lesson) {
                    return parseInt(lesson.lesson_id);
                  });
                  scope.guanxiuIndexes = indexes;
                  return true;
                });
          };

          /// Converts Guanxiu records to the format that accepted by the zhibei
          /// system.
          /// Input:
          ///  [
          ///     {"sub_index":6,"sum":2,"duration":70},
          ///     {"sub_index":7,"sum":1,"duration":30},
          ///     {"sub_index":9,"sum":1,"duration":30}
          ///  ]
          /// Output:
          /// {count: [2, 1, 0, 1], time: [1.2, 0.5, 0, 0.5]}
          scope.getTimedTaskRecords = function(stats, indexes) {
            var count = [], time = [];
            indexes.forEach(function(index) {
              var record = stats[index - 1];
              count.push(record && record.sum || 0);
              time.push(utils.toGuanxiuHour(record && record.duration || 0));
            });
            
            return {
              count: count,
              time: time
            }
          };

          scope.get_guanxiu_task = function() {
            for (var id in scope.tasks) {
              var task = scope.tasks[id];
              if (task.duration) return task;
            }
          };

          scope.report_guanxiu_task = function() {
            scope.guanxiuTask = scope.get_guanxiu_task();
            
            if (!scope.guanxiuTask) {
              return utils.truePromise();
            }

            scope.totalTasks = 0;
            scope.finished = 0;

            var requests = [
                scope.getTaskSubIndexes,
                scope.get_guanxiu_stats,
                scope.report_guanxiu_stats
            ];
            return utils.requestOneByOne(requests);
          };

          scope.get_guanxiu_stats = function() {
            var indexes = scope.guanxiuIndexes;
            if (indexes.length == 0) utils.truePromise();

            var start_time = indexes[0];
            var end_time = indexes[indexes.length - 1];
            
            return rpc.get_class_task_stats(scope.classId, scope.guanxiuTask.id,
                start_time, end_time, 1).then(function(response) {
                  response.data.forEach(function(user) {
                    scope.users[user.id].guanxiuStats = user.stats;
                  });
                  return true;
                });
          };
          
          scope.report_guanxiu_stats = function() {
            var taskKey = '观修';

            var requests = [];
            utils.forEach(scope.users, function(user) {
              var stats = user.guanxiuStats;
              if (utils.isEmpty(stats)) return;
              if (scope.checkUserTask(user, taskKey)) return;

              var record = scope.getTimedTaskRecords(stats,
                  scope.guanxiuIndexes);
              var nonZero = function(value) {return value != 0;};
              if (!utils.any(record.count, nonZero)) return;

              var request = function() {
                scope.statusText = '正在为"{0}"提交{1}半学期"{2}"任务记录...'.
                    format(user.name, ['上', '下'][scope.half_term % 2],
                        taskKey);

                return zbrpc.report_guanxiu_task(
                    scope.classInfo.zb_id, user.zb_id,
                    scope.half_term, record.count,
                    record.time).then(function(response) {
                      scope.finished++;
                      return scope.checkResponse(response, user, taskKey);
                    });
              };
              requests.push(request);
            });

            scope.totalTasks += requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.report_jx_task = function() {
            var requests = [];
            utils.forEach(scope.users, function(user) {
              requests.push(function() {
                return scope.report_jx_task_for_user(user);
              });
            });

            scope.finished = 0;
            scope.totalTasks = requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.get_preclass_lessons = function() {
            var half_term = scope.half_term;
            return zbrpc.get_preclass_lessons(scope.classInfo.zb_id,
                scope.get_zb_courseId(), half_term).then(function(response) {
                  scope.finished++;
                  scope.lessons = response.data.data;
                  return true;
                });
          };
          
          scope.report_attendance_for_user = function(user) {
            var taskKey = '出席';
            if (scope.checkUserTask(user, taskKey)) {
              return utils.truePromise();
            }

            var half_term = scope.half_term;
            var atts = scope.get_attendance(user);
            // If there is no attendance record, might be transferred users.
            if (!atts[0] && !atts[1]) {
              var index = half_term % 2;
              var zbAttendanceRecord = scope.zbScheduleStats[user.zb_id];
              if (!zbAttendanceRecord) {
                alert("用户{0}没在智悲系统本班中，".format(user.name) +
                    "如果是新注册用户，请先同步“班级信息”");
              } else {
                atts[index] = scope.zbScheduleStats[user.zb_id].att;
              }
            }
            var records = scope.getBookAudioRecords(scope.lessons, user, true);
            var otherTasks = scope.classInfo.department_id == JIA_XING ?
              {} : (scope.users[user.id].taskStats || {});

            var gridName = scope.get_report_type(ATT_LIMIT_GRID);
            // 净土第一学期只报出勤
            if (scope.scheduleGroup.term == 1 &&
                scope.classInfo.department_id == JINGTU_DEPARTMENT) {
              gridName = 'att_grid';
            }
            scope.statusText = '正在为"{0}"提交{1}半学期{2}记录...'.format(
                user.name, ['上', '下'][scope.half_term % 2], taskKey);
            return zbrpc.report_limited_schedule_task(gridName,
                scope.classInfo.zb_id, user.zb_id, half_term, records.book,
                records.audio, atts[half_term % 2],
                otherTasks).then(function(response) {
                  scope.finished++;
                  return scope.checkResponse(response, user, taskKey);
                });
          };
          
          scope.getTasks = function() {
            var classId = scope.classInfo.id;
            var depId = scope.classInfo.department_id;
            return utils.getTasks(rpc, depId, classId)
                .then(function(tasks) {
                  return scope.tasks = utils.where(tasks,
                      function(task) {
                        return task.zb_name &&
                            task.report_half_term <= scope.half_term;
                      });
                });
          };
          
          scope.getTaskStats = function(task, start_time, end_time) {
            return rpc.get_class_task_stats(scope.classId, task.id,
                start_time, end_time).then(function(response) {
                  var users = response.data || [];
                  users.forEach(function(user) {
                    var taskStats = scope.users[user.id].taskStats;
                    var parts = (task.zb_name || '').split('_');
                    var zbStat = scope.zbTaskStats[user.zb_id] || {};
                    var stat = user.stats[0] || {sum: 0, duration: 0};
                    if (parts.length == 2) {
                      var countKey = parts[0] + '_count';
                      // Do not erase data of transferred students.
                      var existingValue = parseInt(zbStat[countKey]) || 0;

                      if (!taskStats[countKey]) {
                        // !!!! This is important do not change !!!!
                        // We stores 藏文 and 汉文 佛号 separately but when
                        // reporting we only report one of them. So suppose
                        // someone did 汉文 佛号 100 and 藏文 0, taskStats will
                        // become '藏文 0' eventually if we remove the above
                        // if check.
                        // Do not overwrite the existing value written with
                        // a different type (e.g. if fohao_count has value with
                        // fohao_type 0, do not reset it with fohao_type 1.
                        taskStats[countKey] = stat.sum || existingValue;
                        taskStats[parts[0] + '_type'] = parts[1];
                      }
                    } else {
                      var countKey = task.zb_name + '_count'; 
                      // Do not erase data of transferred students.
                      var existingValue = parseInt(zbStat[countKey]) || 0;
                      taskStats[countKey] = stat.sum || existingValue;
                      if (task.name.indexOf('/') >= 0) {
                        taskStats[task.zb_name + '_type'] = stat.sub_index || 0;
                      }
                    }
                    if (task.duration) {
                      var timeKey = task.zb_name + '_time'; 
                      var hour = utils.toGuanxiuHour(stat.duration);
                      // Do not erase data of transferred students.
                      var existingValue = zbStat[timeKey] || 0;
                      taskStats[timeKey] = 
                          parseInt(10 * hour) ? hour : existingValue;
                    }
                  });
                  return true; 
                });
          };

          /// Retrieves the last reporting time that was stored at the
          /// 'end_time' field for a schedule group.
          scope.getLastReportTime = function() {
            scope.lastReportTime = 0;

            return rpc.get_schedules(scope.classId,
                scope.scheduleGroup.term - 1).then(function(response) {
              var group = utils.first(response.data.groups);
              scope.lastReportTime = group && group.end_time;
              return true;
            });
          };

          /// Returns the end cut time for reporting tasks like dingli, for the
          /// current term (specified by scope.scheduleGroup), as a timestamp.
          scope.getTermEndCutTime = function(extraReportTime) {
            // If we ever reported for this term, the cut time is settled down.  
            if (scope.scheduleGroup.end_time) {
              return scope.scheduleGroup.end_time;
            }
            // The cut date could not be later than 15 days after the term end. 
            var cut = utils.roundToDefaultStartTime(scope.getEndTerm()) +
                extraReportTime;
            var now = utils.unixTimestamp(new Date());
            return Math.min(now, cut);
          };

          /// Gets the start time corresponding to [halfTerm].
          function getStartTime(halfTerm) {
            var date = utils.toDateTime(scope.scheduleGroup.start_time);
            var halfTerms = halfTerm - scope.scheduleGroup.term * 2;
            var months = halfTerms * 3;
            date.setMonth(date.getMonth() + months);
            return utils.unixTimestamp(date); 
          }

          /// Collects all task reports since last report.
          ///
          /// By default if there is no special reason the time is cut between
          /// dates like 06/16 00:00:00 and 12/16 00:00:00. Otherwise if a
          /// special time is previously cut (and saved), use that time.
          scope.getAllTaskStats = function() {
            var fistHalf = scope.half_term % 2 == 0;
            // A lot of people were not able to report their tasks
            // in time. Add this extra 15 days to avoid a zero number.
            var extraReportTime = utils.extraReportTime;

            var startTerm =
                utils.roundToDefaultStartTime(scope.scheduleGroup.start_time);
            var midTerm = utils.getMidTerm(scope.scheduleGroup) +
                extraReportTime;
            var end_cut_time = scope.getTermEndCutTime(extraReportTime);
            if (!fistHalf) scope.scheduleGroup.end_time = end_cut_time;

            var requests = [];
            utils.forEach(scope.tasks, function(task) {
              requests.push(function() {
                // Is this the first time to report the [task]?
                // For first time reporting, do not skip the first 15 days.
                var isFirstTime = task.report_half_term == scope.half_term;
                var start_cut_time = isFirstTime
                    ? getStartTime(task.starting_half_term) 
                    : (scope.lastReportTime || (startTerm + extraReportTime));
                var start_time = fistHalf ? start_cut_time : midTerm;
                var end_time = fistHalf ? midTerm : end_cut_time;
                return scope.getTaskStats(task, start_time, end_time);
              });
            });
            return utils.requestOneByOne(requests);
          };
          
          scope.getZBTaskStats = function(gridIndex) {
            return function() {
              var grid = scope.get_report_type(gridIndex);
              var pre_classID = scope.classInfo.zb_id;
              var halfTerm = scope.half_term;
              return zbrpc.get_task_records(grid, pre_classID, halfTerm)
                  .then(function(response) {
                var stats = response.data.data;
                scope.zbTaskStats = {};
                (stats || []).forEach(function(stat) {
                  scope.zbTaskStats[stat.userID] = stat;
                });
                return scope.zbTaskStats;
              });
            };
          };
          
          scope.getZBScheduleTaskStats = function(grid) {
            return function() {
              var pre_classID = scope.classInfo.zb_id;
              var halfTerm = scope.half_term;
              return zbrpc.get_task_records(grid, pre_classID, halfTerm)
                  .then(function(response) {
                var stats = response.data.data;
                scope.zbScheduleStats = scope.zbScheduleStats || {};
                (stats || []).forEach(function(stat) {
                  var userStat = scope.zbScheduleStats[stat.userID] || {
                    name: stat.name,
                    main: {},
                    limit: {}
                  };
                  scope.zbScheduleStats[stat.userID] = userStat;
                  var bookAudio = {
                    audio: [],
                    book: [],
                  };
                  for (var key in stat) {
                    if (!key) continue;
                    if (key.startsWith('audio')) {
                      bookAudio.audio.push(parseInt(stat[key]));
                    } else if (key.startsWith('book')) {
                      bookAudio.book.push(parseInt(stat[key]));
                    }
                  }
                  if (grid == MAIN_COURSE_GRID_NAME) {
                    userStat.main = bookAudio;
                  } else {
                    userStat.limit = bookAudio;
                    userStat.att = stat.att;
                  }
                });
                return scope.zbScheduleStats;
              });
            };
          };

          scope.report_attendance = function() {
            scope.totalTasks = 0;
            scope.finished = 0;

            var requests = [
                scope.getTasks,
                scope.get_preclass_lessons,
                scope.getLastReportTime,
                scope.getAllTaskStats,
                scope.saveReportTime
            ];
            utils.forEach(scope.users, function(user) {
              requests.push(function() {
                return scope.report_attendance_for_user(user);
              });
            });

            scope.totalTasks += requests.length;
            return utils.requestOneByOne(requests);
          };

          scope.getLocalId = function() {
            return rpc.get_classes().then(function(response) {
              scope.classInfo = response.data[scope.classId];
              var classes = utils.where(response.data, function(classInfo) {
                return classInfo.start_year == scope.classInfo.start_year &&
                    classInfo.department_id == scope.classInfo.department_id;
              });
              var localId = 0;
              for (var id in classes) {
                localId++;
                if (id == scope.classId) return localId;
              }
            });
          };
          // deparment 1: 基础班
          // deparment 2: 入行论班
          // deparment 3: 加行班
          // deparment 4: 净土班
          // courseId: 加行：1，入行论：2，净土：3
          scope.get_zb_courseId = function() {
            return {
              2: 2,
              3: 1,
              4: 3
            }[scope.classInfo.department_id];
          };
          
          /// Returns the 'type' field when reporting.
          ///
          /// grid 0: the main audio/book grid
          /// grid 1: the task/work grid
          /// grid 2: the limited class and attendance gird
          /// grid 4: the guanxiu grid
          scope.get_report_type = function(grid) {
            switch (scope.classInfo.department_id) {
            case 2:
              return ['rxl_grid', '', 'rxl_work_grid'][grid];
            case 3:
              return ['jx_grid', 'jxWork_grid', 'att_limit_grid',
                  'guanxiu_grid'][grid];
            case JINGTU_DEPARTMENT:
              return ['jt_grid', '', 'fohao_att_limit_grid'][grid];
            default:
              return null;
            };
          };

          scope.sync_users = function() {
            var taskKey = '用户信息';
            var users = scope.users;
            var pre_classID = scope.classInfo.zb_id;
            
            scope.statusText = '正在获取智悲用户列表...';

            scope.totalTasks += 1;

            return zbrpc.list_users(pre_classID).then(function(response) {
              scope.finished++;

              var zb_users = response.data.data;
              scope.update_zb_ids(users, zb_users);

              var requests = [];
              utils.forEach(users, function(user) {
                if (scope.checkUserTask(user, taskKey, 0)) return;
                
                // User is in the zb system but not in this zb class.
                // Need to transfer the user first
                if (user.zb_id && !scope.zb_users_map[user.name]) {
                    var getPreClassID = function() {
                      return zbrpc.get_user_preclass(user.zb_id)
                          .then(function(preClass) {
                              user.zb_status = parseInt(preClass.status);
                              return user.zb_class_id =
                                  parseInt(preClass.pre_classID);
                            });  
                    };
                  requests.push(getPreClassID);
                  function recover() {
                      // No need to recover, do nothing.
                      if (user.zb_status != 11) return utils.truePromise();
                      return zbrpc.recover_user(user.zb_class_id, user.zb_id);
                  }
                  requests.push(recover);
                  var transfer = function() {
                    return zbrpc.transfer_user(user.zb_id, user.zb_class_id,
                        pre_classID, 'sync');
                  };
                  requests.push(transfer);
                }
                var request = function() {
                  return (user.zb_id ? zbrpc.update_user(user) :
                    zbrpc.create_user(pre_classID, user))
                        .then(function(response) {
                          scope.finished++;
                          scope.userCreated = true;
                          return scope.checkResponse(response, user, taskKey,
                              0);
                        });
                };
                requests.push(request);
              });
              requests.push(scope.checkUsers);
              scope.totalTasks += requests.length;
              scope.statusText = '正在上报用户信息...';

              return utils.requestOneByOne(requests).then(function() {
                if (!scope.userCreated) return true;

                return zbrpc.list_users(pre_classID).then(function(response) {
                  return scope.update_zb_ids(users, response.data.data);
                });
              });
            });
          },
          
          scope.checkUsers = function() {
            var preClassID = scope.classInfo.zb_id;
            return zbrpc.list_users(preClassID).then(function(response) {
              var problems = [];
              var zb_users = response.data.data;
              var zb_users_map = {};

              scope.finished++;
              zb_users.forEach(function(zb_user) {
                if (!zbrpc.is_normal_user(zb_user)) return;
                zb_users_map[zb_user.userID] = zb_user;
              });
              var local_user_map = {};
              utils.forEach(scope.users, function(user) {
                if (!user.zb_id || !zb_users_map[user.zb_id]) {
                  problems.push(user.name);
                  return;
                }
                local_user_map[user.zb_id] = user;
              });
              for (var id in zb_users_map) {
                if (!local_user_map[id]) {
                  problems.push(zb_users_map[id].name);
                }
              }
              if (!problems.length) return true;

              alert('请检查如下的用户，他们的记录缺失。如果在学院（智悲）系统缺失，可能是' + 
                  '因为他在别的班中，需要到学院系统换班；如果在本系统缺失，可能是因为他在' +
                  '学院系统转学，需要手工同步到本系统中（因为自动同步还没开发）\n\n' +
                  problems.join('\n'));
              return false;
            });
          };
          /// courseId: 加行：1，入行论：2，净土：3
          /// startdate: '2015-06-01'
          /// district1: '美国'
          /// localID: 1, 2, 3, ...
          scope.sync_class = function() {
            var classInfo = scope.classInfo;

            if (classInfo.zb_id) {
              return scope.sync_users();
            }

            scope.totalTasks = 2;
            scope.finished = 0;
            scope.statusText = '正在查找班级信息';

            // courseId, startdate, district1, localID
            var courseId = scope.get_zb_courseId();
            var startdate = '' + classInfo.start_year + '-06-01';
            return scope.getLocalId().then(function(localID) {
              scope.finished++;
              
              scope.localID = localID;
              return zbrpc.search_class(courseId, startdate, '美国', localID)
              .then(function(response) {
                scope.finished++;

                var results = response.data.data;
                if (results && results[0]) {
                  classInfo.zb_id = results[0].pre_classID;
                  rpc.update_class(classInfo);
                  return scope.sync_users();
                }

                scope.totalTask += 1;
                return zbrpc.get_root_groups().then(function(response) {
                  scope.finished++;
                  
                  $rootScope.$broadcast('init-zb-roots', {
                    zbGroups: response.data.data,
                    rootGroupSelected: scope.rootGroupSelected,
                  });
                  document.querySelector('#zb-choose-root').open();

                  scope.deferredSyncClass = $q.defer();
                  return scope.deferredSyncClass.promise;
                });
              });
            });
          };
          /// Store zb ids for corresponding users in database.
          scope.update_zb_ids = function(users, zb_users) {
            var zb_users_map = {};
            zb_users.forEach(function(zb_user) {
              if (parseInt(zb_user.status) == 11) return;
              zb_users_map[zb_user.name] = zb_user;
            });
            scope.zb_users_map = zb_users_map;

            var requests = [];
            utils.forEach(users, function(user) {
              var zb_user = zb_users_map[user.name];
              if (!zb_user) return;

              var oldId = user.zb_id;
              user.zb_id = zb_user.userID;
              if (parseInt(oldId) != parseInt(user.zb_id)) {
                var request = function() {
                  return rpc.update_user(user).then(function(response) {
                    return response.data.updated;
                  });
                };
                requests.push(request);
              }
            });
            
            return utils.requestOneByOne(requests);
          };
          scope.rootGroupSelected = function(selectedZbGroupId) {
            var classInfo = scope.classInfo;
            var courseId = scope.get_zb_courseId();
            var startdate = '' + classInfo.start_year + '-06-01';
            
            scope.statusText = '正在创建智悲班级';
            scope.totalTasks += 1;

            return zbrpc.create_class(selectedZbGroupId,
                courseId, startdate, '美国', scope.localID)
                .then(function(response) {
                  scope.finished++;

                  classInfo.zb_id = response.data.pre_classID;
                  if (classInfo.zb_id) {
                    rpc.update_class(classInfo);
                    return scope.sync_users().then(function(result) {
                      scope.deferredSyncClass.resolve(result);
                    });
                  }
                  alert('failed to create zhibei class.');
                  scope.deferredSyncClass.resolve(false);
                });
          };
          scope.cancel = function() {
            zbrpc.cancel();
          };

          scope.parse_serial_number = function(sn) {
            var prefix, index;
            var m = /(.+)-([0-9]+)/.exec(sn);
            if (m && m[2]) {
              prefix = m[1] + '-';
              index = parseInt(m[2]);
            } else {
              m = /([0-9]+)$/.exec(sn);
              if (!m || !m[1]) return null;

              index = parseInt(m[1]);
              prefix = sn.substring(0, sn.length - m[1].length);
            }
            
            return {prefix: prefix, index: index};
          };

          scope.allocate_serial_number = function() {
            var prefixes = {};
            var maxIndexes = {};

            utils.forEach(scope.users, function(user) {
              var sn = scope.parse_serial_number(user.internal_id);
              if (!sn) return;
              
              prefixes[sn.prefix] = (prefixes[sn.prefix] || 0) + 1;
              maxIndexes[sn.prefix] =
                  Math.max(maxIndexes[sn.prefix] || 0, sn.index);
            });

            var prefix;
            var maxOccur = 0;
            for (var key in prefixes) {
              if (prefixes[key] > maxOccur) {
                maxOccur = prefixes[key];
                prefix = key;
              }
            }
            
            if (!prefix) {
              prefix = {
                  2: 'C',
                  3: 'A',
                  4: 'B'
              }[scope.classInfo.department_id];
              prefix = (prefix || '') +
                  (scope.classInfo.start_year % 100) + '-06-';
            }

            var index = (maxIndexes[prefix] || 0);
            var nextSn = function() {
              index++;
              var sn = prefix + (index < 10 ? ('0' + index) : index);
              return rpc.get_users(null, null, sn).then(function(response) {
                return utils.isEmpty(response.data) ?
                    (scope.sn = sn) : nextSn();
              });
            };
            return nextSn();
          };
          scope.check_serial_numbers = function() {
            var requests = [];
            utils.forEach(scope.users, function(user) {
              if (user.internal_id) return;
              requests.push(scope.allocate_serial_number);
              requests.push(function() {
                user.internal_id = scope.sn;
                return rpc.update_user(user);
              });
            });
            return utils.requestOneByOne(requests);
          };
          scope.saveReportTime = function() {
            var group = scope.scheduleGroup;
            if (!group.end_time) return utils.truePromise();
            return rpc.update_schedule_group({id: group.id,
              end_time: group.end_time});
          };
          scope.endTimeLabel = function() {
            var tm = scope.scheduleGroup && scope.scheduleGroup.end_time;
            return tm ?
                '(上报时间' + utils.toDateTime(tm).toLocaleString() + ')' : '';
          };
          scope.fetch_zb_scores = function() {
            var pre_classID = scope.classInfo.zb_id;
            return zbrpc.get_scores(pre_classID).then(function(response) {
              var scores = response.data.data;
              if (!scores) {
                alert('Failed to fetch scores from zhibei.info');
                return false;
              }
              scope.scores = {};
              scores.forEach(function(score) {
                scope.scores[score.userID] = score;
              });
              return scope.scores;
            });
          };
          function merge_from_local(localScore, score) {
            score.pre_classID = scope.classInfo.zb_id;

            var old = {};
            utils.mix_in(old, score);

            if (localScore.type1) {
              score.exam1_open = utils.examLabels[localScore.type1];
              score.exam1_score = localScore.score1 || score.exam1_score; 
            }
            if (localScore.type2) {
              score.exam2_open = utils.examLabels[localScore.type2];
              score.exam2_score = localScore.score2 || score.exam2_score; 
            }
            score.changed = utils.diff(old, score);
          }
          function merge_from_zb(localScore, score) {
            var old = {};
            utils.mix_in(old, localScore);
            localScore.type1 = utils.examLabels.indexOf(score.exam1_open);
            if (localScore.type1 < 0) localScore.type1 = 0;
            localScore.score1 = parseInt(score.exam1_score) || 0;
            localScore.type2 = utils.examLabels.indexOf(score.exam2_open);
            if (localScore.type2 < 0) localScore.type2 = 0;
            localScore.score2 = parseInt(score.exam2_score) || 0;
            localScore.changed = localScore.type1 > 0 || localScore.type2 > 0;
          }
          function merge_scores(scores) {
            utils.forEach(scope.users, function(user) {
              var localScore = scores[user.id];
              var score = scope.scores[user.zb_id];
              if (!score) {
                alert('用户"{0}"不在智悲系统本班中，'.format(user.name) +
                    '请先同步用户或去智悲系统转班');
                return;
              }
              if (localScore) {
                merge_from_local(localScore, score);
              } else {
                localScore = user;
                localScore.user_id = user.id;
                merge_from_zb(localScore, score);
              }
            });
            return scope.local_scores = scores;
          }
          scope.fetch_scores = function() {
            return rpc.get_scores(scope.classId).then(function(response) {
              merge_scores(response.data);
              return scope.local_scores = response.data;
            });
          };
          scope.update_scores = function() {
            function changed(score) { return score.changed; }
            function toRequest(score) { 
              return function() { return rpc.update_scores(score);}
            }
            var requests = utils.map(utils.where(scope.users, changed), 
                toRequest);
            return utils.requestOneByOne(requests);
          };
          scope.update_zb_scores = function() {
            function changed(score) { return score.changed; }
            function toRequest(score) {
              return function() { return zbrpc.report_score(score);}
            }
            var requests = utils.map(utils.where(scope.scores, changed), 
                toRequest);
            return utils.requestOneByOne(requests);
          };

          var zbTasks, localTasks;
          function getZbTaskReportTerms() {
            var grid = scope.get_report_type(WORK_GRID);
            var pre_classID = scope.classInfo.zb_id;
            var allTerms = [];
            for (var halfTerm = 4; halfTerm <= 17; halfTerm++) {
              allTerms.push(halfTerm);
            }
            zbTasks = {};
            var requests = [];
            var totalTasks = 0;
            utils.forEach(localTasks, function(task) {
              if (task.zb_name && task.zb_name != 'guanxiu') {
                totalTasks++;
              }
            });
            // Use forEach and closure. Don't use for loop.
            allTerms.forEach(function(halfTerm) {
              var request = function() {
                if (utils.keys(zbTasks).length == totalTasks) {
                  return utils.truePromise();
                }
                return zbrpc.get_task_records(grid, pre_classID, halfTerm)
                    .then(function(response) {
                  var user = response.data.data[0];
                  if (!user) return true;
                  for (var key in user) {
                    if (!key || !key.endsWith('_total')) continue;
                    var zbTaskName = key.split('_')[0];
                    zbTasks[zbTaskName] = zbTasks[zbTaskName] || halfTerm;
                  }
                  return true;
                });
              };
              requests.push(request);
            });
            return utils.requestOneByOne(requests);
          }
          function getLocalTasks() {
             var classId = scope.classInfo.id;
            var depId = scope.classInfo.department_id;
            return utils.getTasks(rpc, depId, classId).then(function(tasks) {
              return localTasks = tasks;
            });
          }
          function updateTaskArranges() {
            var classId = scope.classInfo.id;
            function updateArrange(task) {
              var zbReportTerm = zbTasks[task.zb_name];
              return function() {
                if (!zbReportTerm || zbReportTerm == task.report_half_term) {
                  return utils.truePromise();
                }
                return rpc.update_task_arranges(classId, task.id,
                    task.starting_half_term,
                    zbReportTerm);
                };
            }
            return utils.requestOneByOne(utils.map(localTasks, updateArrange))
                .then(function() {
               $rootScope.$broadcast('reload-task-arrange');
            });
          }

          scope.totalTasks = 0;
          scope.finished = 0;
          scope.results = {};
        },
        templateUrl: 'js/zb_sync_button/zb_sync_button.html'
      };
    });
});
