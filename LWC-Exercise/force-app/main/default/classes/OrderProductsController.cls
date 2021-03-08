public with sharing class OrderProductsController {
   @AuraEnabled(cacheable=true)
   public static String getOrderProducts(String orderId, String sortBy, String sortDirection) {
     
      String query = 'SELECT Id, PricebookEntry.Product2.Name,Quantity,UnitPrice,TotalPrice FROM OrderItem where OrderId=:orderId';
      if ( sortBy != null && sortDirection != null ) {
          if(sortBy.equalsIgnoreCase('Name')){
            query += ' ORDER BY PricebookEntry.Product2.Name ' + sortDirection;
          }else{
            query += ' ORDER BY ' + sortBy + ' ' + sortDirection;
          }
      }
      System.debug('OrderProductsController query:' + query);

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
}
