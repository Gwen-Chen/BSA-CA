define('invoice/invoice', ['address_editor/address_editor'], function() {
  return angular.module('InvoiceModule', ['AddressEditorModule'])
    .directive('invoice', function() {
      return {
        scope: {
          order: '='
        },
        templateUrl : 'js/invoice/invoice.html?tag=201706041104'
      };
    });
});
