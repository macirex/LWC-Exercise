public with sharing class OrderProductsController {
   @AuraEnabled(cacheable=true)
   public static String getOrderProducts(String orderId, String sortBy, String sortDirection) {
     
      String query = 'SELECT PricebookEntry.Product2.Name,Quantity,UnitPrice,TotalPrice FROM OrderItem where OrderId=:orderId';
      if ( sortBy != null && sortDirection != null ) {
          if(sortBy.equalsIgnoreCase('Name')){
            query += ' ORDER BY PricebookEntry.Product2.Name ' + sortDirection;
          }else{
            query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
          }
      }

      List <Map<String,String>> orderProductsList = new List <Map<String,String>>();
      for(orderItem oI: Database.query(query)){

         Product2 pdt = oI.PricebookEntry.Product2; 

         orderProductsList.add(new Map<String, String>{
                 'Id' => oI.Id,
                 'Name' => pdt.Name,
                 'UnitPrice' => string.valueOf(oI.UnitPrice),
                 'Quantity' => string.valueOf(oI.Quantity),
                 'TotalPrice' => string.valueOf(oI.TotalPrice)
             });
        }       

        return JSON.serialize(orderProductsList);
   }

   @AuraEnabled
   public static Map<String,String> updateExternalRecord (String jsonData) {
        HttpRequest request = new HttpRequest();
        HttpResponse response = new HttpResponse();
        Http http = new Http();

        request.setEndpoint('https://test.requestcatcher.com/test');
        request.setMethod('POST');
        request.setbody(jsonData);
        request.setCompressed(true); 

        Map<String,String> updateResponse = new Map<String,String>();  

        try {
          response = http.send(request);
            if (response.getStatusCode() == 200) {
              updateResponse.put('success','true');
            }else{
              updateResponse.put('success','false');
            }
        } catch(System.CalloutException e) {
            System.debug('Callout error: '+ e);
            System.debug(response.toString());
        }

      return updateResponse;
   }
}
