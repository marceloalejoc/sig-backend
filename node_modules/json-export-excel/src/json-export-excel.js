(function () {
    'use strict';
    require('./fileSaver');
    angular.module('ngJsonExportExcel', [])
        .directive('ngJsonExportExcel', function () {
            return {
                restrict: 'AE',
                scope: {
                    data : '=',
                    filename: '=?',
                    reportFields: '=',
                    separator: '@'
                },
                link: function (scope, element) {
                    scope.filename = !!scope.filename ? scope.filename : 'export-excel';
                    scope.fileSaver =  require('./fileSaver');
                    var fields = [];
                    var header = [];
                    var separator = scope.separator || ';';

                    angular.forEach(scope.reportFields, function(field, key) {
                        if(!field || !key) {
                            throw new Error('error json report fields');
                        }

                        fields.push(key);
                        header.push(field);
                    });

                    element.bind('click', function() {
                       return _bodyData().then(function (bodyData) {
                            var strData = _convertToExcel(bodyData);

                            var blob = new Blob([strData], {type: "text/plain;charset=utf-8"});

                            return scope.fileSaver.saveAs(blob, [scope.filename + '.csv']);
                          });

                    });

                    function _bodyData() {
                       return scope.data()
                          .then(function (data) {
                            var body = "";
                            angular.forEach(data, function(dataItem) {
                              var rowItems = [];

                              angular.forEach(fields, function(field) {

                                rowItems.push('"' + _objectToString(dataItem[field]) + '"');

                              });

                              body += rowItems.join(separator) + '\n';
                            });

                            return body;
                          });
                    }

                    function _convertToExcel(body) {
                        return header.join(separator) + '\n' + body;
                    }

                    function _objectToString(object) {
                      var output = '';
                      if( Object.prototype.toString.call( object ) === '[object Array]' ) {
                        return object.join(separator);
                      }

                      if (typeof object === 'string' && object.indexOf('"')) {
                        object = object.split('"').join('""');
                      }
                      return object;
                    }
                }
            };
        });
})();
